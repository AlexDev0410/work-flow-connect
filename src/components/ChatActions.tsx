
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { 
  MoreVertical, 
  Trash2, 
  Star, 
  StarOff,
  Pin,
  Search,
  PaperclipIcon,
  File,
  FileText,
  FileAudio,
  FileImage,
  Smile,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChatType, MessageType } from '@/contexts/ChatContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useTheme } from '@/contexts/ThemeContext';

interface ChatActionsProps {
  chat: ChatType;
  onDelete: (chatId: string) => void;
  onToggleFavorite: (chatId: string) => void;
  onPinMessage: (messageId: string, duration: string) => void;
  onSearchMessages: (query: string) => MessageType[];
  onFileUpload: (file: File) => void;
  onInsertEmoji: (emoji: string) => void;
  isFavorite: boolean;
  scrollToMessage?: (messageId: string) => void;
}

export const ChatActions: React.FC<ChatActionsProps> = ({
  chat,
  onDelete,
  onToggleFavorite,
  onPinMessage,
  onSearchMessages,
  onFileUpload,
  onInsertEmoji,
  isFavorite,
  scrollToMessage
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);
  const [pinDuration, setPinDuration] = useState('1h');
  const [searchResults, setSearchResults] = useState<MessageType[]>([]);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    const results = onSearchMessages(searchQuery);
    setSearchResults(results);
    setNoResultsFound(results.length === 0);
    
    if (results.length > 0 && scrollToMessage) {
      // Store the results first
      const firstMessageId = results[0].id;
      
      // Close dialog and clear state
      handleSearchDialogClose();
      
      // Use setTimeout to ensure the dialog is fully closed before scrolling
      setTimeout(() => {
        if (scrollToMessage) {
          scrollToMessage(firstMessageId);
        }
      }, 300);
    } else if (results.length === 0) {
      toast({
        title: "Búsqueda",
        description: "No se encontraron mensajes que coincidan con tu búsqueda",
        variant: "destructive"
      });
    }
  };

  // Clean up function to reset states when dialog closes
  const handleSearchDialogClose = () => {
    setIsSearchDialogOpen(false);
    setSearchQuery('');
    setNoResultsFound(false);
    setSearchResults([]);
  };

  const handlePinMessage = () => {
    if (selectedMessage) {
      onPinMessage(selectedMessage.id, pinDuration);
      setIsPinDialogOpen(false);
      setSelectedMessage(null);
      
      // Show toast with appropriate message
      const durationMap = {
        '1h': '1 hora',
        '24h': '24 horas',
        '3d': '3 días',
        '7d': '7 días'
      };
      
      toast({
        title: "Mensaje fijado",
        description: `El mensaje ha sido fijado por ${durationMap[pinDuration as keyof typeof durationMap]}.`
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      
      // Reset the file input so the same file can be selected again
      e.target.value = '';
      
      toast({
        title: "Archivo adjuntado",
        description: `${file.name} ha sido adjuntado al chat.`
      });
    }
  };

  const handleFileTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteChat = () => {
    onDelete(chat.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Opciones de chat</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => onToggleFavorite(chat.id)}>
            {isFavorite ? (
              <>
                <StarOff className="h-4 w-4 mr-2" />
                <span>Quitar de favoritos</span>
              </>
            ) : (
              <>
                <Star className="h-4 w-4 mr-2" />
                <span>Marcar como favorito</span>
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => {
              setIsSearchDialogOpen(true);
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            <span>Buscar en la conversación</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setIsPinDialogOpen(true)}>
            <Pin className="h-4 w-4 mr-2" />
            <span>Fijar mensaje</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleFileTrigger}>
            <PaperclipIcon className="h-4 w-4 mr-2" />
            <span>Adjuntar archivo</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => {
              setIsDeleteDialogOpen(true);
            }} 
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span>Eliminar conversación</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }} 
        accept=".doc,.docx,.pdf,.txt,.mp3,.mp4,.zip,.rar,.jpg,.jpeg,.png,.gif"
      />
      
      {/* Delete confirmation dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            // When closing dialog via escape key or clicking outside
            setIsDeleteDialogOpen(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta conversación y todos sus mensajes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteChat()}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Search dialog */}
      <Dialog 
        open={isSearchDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleSearchDialogClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buscar en la conversación</DialogTitle>
            <DialogDescription>
              Ingresa el texto que deseas buscar en esta conversación.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div>
              <Label htmlFor="search">Texto a buscar</Label>
              <Input 
                id="search"
                placeholder="Buscar mensajes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>
            
            {noResultsFound && searchQuery.trim() !== '' && (
              <div className="text-center py-2 text-red-500">
                No se encontraron mensajes que coincidan con tu búsqueda.
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="max-h-64 overflow-y-auto border rounded-md p-2">
                <p className="text-sm font-medium mb-2">
                  {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'} encontrados:
                </p>
                <div className="space-y-2">
                  {searchResults.map(msg => (
                    <div 
                      key={msg.id}
                      className="p-2 rounded-md bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        if (scrollToMessage) {
                          // Store message ID for scrolling
                          const messageId = msg.id;
                          
                          // Close dialog first
                          handleSearchDialogClose();
                          
                          // Wait for dialog to close before scrolling
                          setTimeout(() => {
                            scrollToMessage(messageId);
                          }, 300);
                        }
                      }}
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm truncate dark:text-white">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSearchDialogClose()}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Buscar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Pin message dialog */}
      <Dialog 
        open={isPinDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsPinDialogOpen(false);
            setSelectedMessage(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fijar mensaje</DialogTitle>
            <DialogDescription>
              Selecciona un mensaje y por cuánto tiempo deseas fijarlo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Seleccionar mensaje</Label>
              <div className="mt-2 max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                {chat.messages.slice(-10).map(message => (
                  <div 
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-2 rounded-md cursor-pointer truncate
                      ${selectedMessage?.id === message.id 
                        ? 'bg-wfc-purple/10 border-2 border-wfc-purple' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                    `}
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-sm dark:text-gray-300">{message.content}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Duración</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { value: '1h', label: '1 hora' },
                  { value: '24h', label: '24 horas' },
                  { value: '3d', label: '3 días' },
                  { value: '7d', label: '7 días' }
                ].map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={pinDuration === option.value ? 'default' : 'outline'}
                    className={pinDuration === option.value ? 'bg-wfc-purple hover:bg-wfc-purple-medium' : ''}
                    onClick={() => setPinDuration(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsPinDialogOpen(false);
                setSelectedMessage(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={() => handlePinMessage()}
              disabled={!selectedMessage}
              className="bg-wfc-purple hover:bg-wfc-purple-medium"
            >
              Fijar mensaje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emoji picker popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-1">
            <Smile className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none shadow-xl" align="end">
          <Picker 
            data={data} 
            onEmojiSelect={(emoji: any) => onInsertEmoji(emoji.native)}
            theme={theme === 'dark' ? 'dark' : 'light'}
          />
        </PopoverContent>
      </Popover>
    </>
  );
};

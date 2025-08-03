import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cleanupAPI } from '@/api/cleanup';

const QuickCleanupButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsLoading(true);
    try {
      const response = await cleanupAPI.cleanupTVInterfaces();
      if (response.success) {
        toast({
          title: "🎉 Успех!",
          description: `Очистка завершена. Создано ${response.data?.created || 0} пользовательских интерфейсов с реальными скриншотами`,
        });
        // Обновляем страницу через 2 секунды
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "❌ Ошибка",
          description: response.error || "Не удалось выполнить очистку TV интерфейсов",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cleaning up TV interfaces:', error);
      toast({
        title: "❌ Ошибка",
        description: "Произошла ошибка при очистке TV интерфейсов",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Очистка...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              🧹 РЕШИТЬ ПРОБЛЕМУ: Создать пользовательские интерфейсы
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>🎯 Создать пользовательские TV интерфейсы?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>Это действие:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>❌ Удалит все тестовые интерфейсы ("Главное меню OpenBox", "Настройки UCLAN")</li>
              <li>✅ Создаст новые пользовательские интерфейсы с реальными скриншотами</li>
              <li>✅ Исправит проблему "Нет скриншота" в редакторе областей</li>
              <li>✅ До��авит кликабельные области для навигации</li>
            </ul>
            <p className="font-medium text-green-600">
              После этого редактор областей интерфейса будет полностью работать!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleCleanup}>
            🚀 Создать пользовательские интерфейсы
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default QuickCleanupButton;

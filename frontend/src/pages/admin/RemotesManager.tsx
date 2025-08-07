import React, { useState, useEffect } from 'react';
import { useApi } from '@/contexts/ApiContext';
import { Remote, Device } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit2, Trash2, Copy, Search, BarChart3, Smartphone, Star } from 'lucide-react';

const RemotesManager = () => {
  const { api } = useApi();
  const [remotes, setRemotes] = useState<Remote[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRemote, setSelectedRemote] = useState<Remote | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [filterLayout, setFilterLayout] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    model: '',
    description: '',
    device_id: '',
    layout: 'standard',
    color_scheme: 'dark',
    image_url: '',
    dimensions: { width: 200, height: 500 },
    is_default: false,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [remotesData, devicesData, statsData] = await Promise.all([
        api.getRemotes(),
        api.getDevices(),
        api.getRemoteStats()
      ]);
      setRemotes(remotesData);
      setDevices(devicesData);
      setStats(statsData);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные пультов',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      manufacturer: '',
      model: '',
      description: '',
      device_id: '',
      layout: 'standard',
      color_scheme: 'dark',
      image_url: '',
      dimensions: { width: 200, height: 500 },
      is_default: false,
      is_active: true
    });
  };

  const handleCreateRemote = async () => {
    try {
      if (!formData.name || !formData.manufacturer || !formData.model) {
        toast({
          title: 'Ошибка валидации',
          description: 'Заполните все обязательные поля',
          variant: 'destructive',
        });
        return;
      }

      await api.createRemote(formData);
      toast({
        title: 'Успех',
        description: 'Пульт успешно создан',
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Ошибка при создании пульта:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать пульт',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRemote = async () => {
    if (!selectedRemote) return;

    try {
      await api.updateRemote(selectedRemote.id, formData);
      toast({
        title: 'Успех',
        description: 'Пульт успешно обновлен',
      });
      setIsEditDialogOpen(false);
      setSelectedRemote(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Ошибка при обновлении пульта:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить пульт',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRemote = async (id: string) => {
    try {
      await api.deleteRemote(id);
      toast({
        title: 'Успех',
        description: 'Пульт успешно удален',
      });
      loadData();
    } catch (error: any) {
      console.error('Ошибка при удалении пульта:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить пульт',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateRemote = async (remote: Remote) => {
    try {
      await api.duplicateRemote(remote.id, `${remote.name} (копия)`);
      toast({
        title: 'Успех',
        description: 'Пульт успешно дублирован',
      });
      loadData();
    } catch (error: any) {
      console.error('Ошибка при дублировании пульта:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось дублировать пульт',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (remote: Remote) => {
    setSelectedRemote(remote);
    setFormData({
      name: remote.name,
      manufacturer: remote.manufacturer,
      model: remote.model,
      description: remote.description || '',
      device_id: remote.deviceId || '',
      layout: remote.layout,
      color_scheme: remote.colorScheme || 'dark',
      image_url: remote.imageUrl || '',
      dimensions: remote.dimensions || { width: 200, height: 500 },
      is_default: remote.isDefault,
      is_active: remote.isActive
    });
    setIsEditDialogOpen(true);
  };

  const filteredRemotes = remotes.filter(remote => {
    const matchesSearch = remote.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         remote.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         remote.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDevice = !filterDevice || filterDevice === 'all' ||
                         (filterDevice === 'universal' && !remote.deviceId) ||
                         remote.deviceId === filterDevice;
    const matchesLayout = !filterLayout || filterLayout === 'all' || remote.layout === filterLayout;

    return matchesSearch && matchesDevice && matchesLayout;
  });

  const getDeviceName = (deviceId: string | null) => {
    if (!deviceId) return 'Универсальный';
    const device = devices.find(d => d.id === deviceId);
    return device ? `${device.brand} ${device.model}` : 'Неизвестно';
  };

  const layoutNames = {
    standard: 'Стандартный',
    compact: 'Компактный',
    smart: 'Умный',
    custom: 'Настраиваемый'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Загрузка ��ультов...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Управление пультами</h1>
          <p className="text-muted-foreground mt-2">
            Управление пультами дистанционного управления для диагностики
          </p>
        </div>
        
        {stats && (
          <div className="flex gap-2">
            <Badge variant="secondary" className="whitespace-nowrap">
              <Smartphone className="h-3 w-3 mr-1" />
              {stats.totalRemotes} всего
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap">
              <Star className="h-3 w-3 mr-1" />
              {stats.defaultCount} по умолчанию
            </Badge>
          </div>
        )}
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Поиск и фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по названию, производителю или модели..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filterDevice} onValueChange={setFilterDevice}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Фильтр по устройству" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все устройства</SelectItem>
                <SelectItem value="universal">Универсальные</SelectItem>
                {devices.map(device => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.brand} {device.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLayout} onValueChange={setFilterLayout}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Фильтр по типу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="standard">Стандартный</SelectItem>
                <SelectItem value="compact">Компактный</SelectItem>
                <SelectItem value="smart">Умный</SelectItem>
                <SelectItem value="custom">Настраиваемый</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать пульт
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Создать новый пульт</DialogTitle>
                  <DialogDescription>
                    Создайте новый пульт дистанционного управления
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Название *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Например: Samsung Standard Remote"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Производитель *</Label>
                      <Input
                        id="manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        placeholder="Samsung"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model">Модель *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="BN59-01315A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="device">Устройство</Label>
                      <Select value={formData.device_id} onValueChange={(value) => setFormData({ ...formData, device_id: value === 'universal' ? '' : value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите устройство" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="universal">Универсальный пульт</SelectItem>
                          {devices.map(device => (
                            <SelectItem key={device.id} value={device.id}>
                              {device.brand} {device.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описа��ие</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Описание пульта..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="layout">Тип layout</Label>
                      <Select value={formData.layout} onValueChange={(value) => setFormData({ ...formData, layout: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Стандартный</SelectItem>
                          <SelectItem value="compact">Компактный</SelectItem>
                          <SelectItem value="smart">Умный</SelectItem>
                          <SelectItem value="custom">Настраиваемый</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color_scheme">Цветовая схема</Label>
                      <Input
                        id="color_scheme"
                        value={formData.color_scheme}
                        onChange={(e) => setFormData({ ...formData, color_scheme: e.target.value })}
                        placeholder="dark"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                    />
                    <Label htmlFor="is_default">Пульт по умолчанию для устройства</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleCreateRemote}>
                    Создать пульт
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Список пультов */}
      {filteredRemotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Smartphone className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Пульты не найдены</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || filterDevice || filterLayout 
                ? 'Попробуйте изменить параметры поиска или фильтрации' 
                : 'Начните с создания первого пульта дистанционного управления'}
            </p>
            {!searchQuery && !filterDevice && !filterLayout && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Создать первый пульт
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRemotes.map((remote) => (
            <Card key={remote.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{remote.name}</h3>
                      {remote.isDefault && (
                        <Badge variant="default">
                          <Star className="h-3 w-3 mr-1" />
                          По умолчанию
                        </Badge>
                      )}
                      <Badge variant="outline">{layoutNames[remote.layout] || remote.layout}</Badge>
                      {!remote.isActive && (
                        <Badge variant="destructive">Неактивен</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Производитель:</strong> {remote.manufacturer}</p>
                      <p><strong>Модель:</strong> {remote.model}</p>
                      <p><strong>Устройство:</strong> {getDeviceName(remote.deviceId)}</p>
                      {remote.description && <p><strong>Описание:</strong> {remote.description}</p>}
                      <p><strong>Использований:</strong> {remote.usageCount || 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateRemote(remote)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(remote)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить пульт?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить пульт "{remote.name}"? 
                            Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRemote(remote.id)}>
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать пульт</DialogTitle>
            <DialogDescription>
              Изменение данных пульта "{selectedRemote?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Назван��е *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-manufacturer">Производитель *</Label>
                <Input
                  id="edit-manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-model">Модель *</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-device">Устройство</Label>
                <Select value={formData.device_id || 'universal'} onValueChange={(value) => setFormData({ ...formData, device_id: value === 'universal' ? '' : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите устройство" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="universal">Универсальный пульт</SelectItem>
                    {devices.map(device => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.brand} {device.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-layout">Тип layout</Label>
                <Select value={formData.layout} onValueChange={(value) => setFormData({ ...formData, layout: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Стандартный</SelectItem>
                    <SelectItem value="compact">Компактный</SelectItem>
                    <SelectItem value="smart">Умный</SelectItem>
                    <SelectItem value="custom">Настраиваемый</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color_scheme">Цветовая схема</Label>
                <Input
                  id="edit-color_scheme"
                  value={formData.color_scheme}
                  onChange={(e) => setFormData({ ...formData, color_scheme: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
                <Label htmlFor="edit-is_default">Пульт по умолчанию для устройства</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit-is_active">Активный пульт</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateRemote}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RemotesManager;

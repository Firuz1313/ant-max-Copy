import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Settings,
  Database,
  Bell,
  Shield,
  Palette,
  Archive,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Monitor,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/api/client";

interface SiteSettings {
  site_name: string;
  site_description: string;
  default_language: string;
  timezone: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  max_sessions_per_user: number;
  session_timeout: number;
  allow_registration: boolean;
  require_email_verification: boolean;
  default_theme: string;
  notification_email: string;
  smtp_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  backup_retention_days: number;
  auto_backup_enabled: boolean;
  auto_backup_frequency: string;
  debug_mode: boolean;
  analytics_enabled: boolean;
  error_reporting: boolean;
}

const defaultSettings: SiteSettings = {
  site_name: "ANT Support",
  site_description: "Система диагностики ТВ-приставок",
  default_language: "ru",
  timezone: "Europe/Moscow",
  maintenance_mode: false,
  maintenance_message: "Сайт временно недоступен для технического обслуживания",
  max_sessions_per_user: 5,
  session_timeout: 30,
  allow_registration: true,
  require_email_verification: false,
  default_theme: "system",
  notification_email: "admin@example.com",
  smtp_enabled: false,
  smtp_host: "",
  smtp_port: 587,
  smtp_username: "",
  smtp_password: "",
  backup_retention_days: 30,
  auto_backup_enabled: true,
  auto_backup_frequency: "daily",
  debug_mode: false,
  analytics_enabled: true,
  error_reporting: true,
};

const SystemSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/settings");
      
      if (response.success && response.data) {
        // Convert settings array to object
        const settingsObj = { ...defaultSettings };
        if (Array.isArray(response.data)) {
          response.data.forEach((setting: any) => {
            if (setting.key && setting.value !== undefined) {
              // Convert string values to proper types
              let value = setting.value;
              if (setting.type === 'boolean') {
                value = value === 'true' || value === true;
              } else if (setting.type === 'number') {
                value = parseInt(value, 10);
              }
              (settingsObj as any)[setting.key] = value;
            }
          });
        }
        setSettings(settingsObj);
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      toast.error('Не удалось загрузить настройки');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Convert settings object to array format expected by backend
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        type: typeof value,
        category: getCategoryForKey(key),
        description: getDescriptionForKey(key),
      }));

      for (const setting of settingsArray) {
        await apiClient.post("/settings", setting);
      }

      toast.success('Настройки успешно сохранены');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryForKey = (key: string): string => {
    if (key.startsWith('site_') || key.includes('language') || key.includes('timezone')) return 'general';
    if (key.includes('session') || key.includes('registration') || key.includes('verification')) return 'security';
    if (key.includes('notification') || key.includes('smtp') || key.includes('email')) return 'notifications';
    if (key.includes('theme') || key.includes('analytics')) return 'appearance';
    if (key.includes('backup') || key.includes('retention')) return 'backup';
    if (key.includes('debug') || key.includes('error') || key.includes('maintenance')) return 'diagnostics';
    return 'general';
  };

  const getDescriptionForKey = (key: string): string => {
    const descriptions: Record<string, string> = {
      site_name: 'Название вашего сайта',
      site_description: 'Краткое описание сайта',
      default_language: 'Язык интерфейса по умолчанию',
      timezone: 'Временная зона',
      maintenance_mode: 'Режим технического обслуживания',
      max_sessions_per_user: 'Максимальное количество сессий на пользователя',
      session_timeout: 'Время жизни сессии в минутах',
      notification_email: 'Email для системных уведомлений',
      backup_retention_days: 'Количество дней хранения резервных копий',
    };
    return descriptions[key] || '';
  };

  const updateSetting = (key: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Загрузка настроек...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Настройки системы
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Управление конфигурацией и параметрами системы
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="flex items-center">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Сохранить изменения
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Общие
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center">
            <Monitor className="h-4 w-4 mr-2" />
            Диагностика
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Безопасность
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Внешний вид
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center">
            <Archive className="h-4 w-4 mr-2" />
            Резервное копирование
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основные настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Название сайта</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => updateSetting('site_name', e.target.value)}
                    placeholder="Введите название сайта"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_language">Язык по умолчанию</Label>
                  <Select
                    value={settings.default_language}
                    onValueChange={(value) => updateSetting('default_language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="uk">Українська</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description">Описание сайта</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => updateSetting('site_description', e.target.value)}
                  placeholder="Введите описание сайта"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Часовой пояс</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => updateSetting('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                      <SelectItem value="Europe/Kiev">Киев (UTC+2)</SelectItem>
                      <SelectItem value="Europe/Minsk">Минск (UTC+3)</SelectItem>
                      <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification_email">Email для уведомлений</Label>
                  <Input
                    id="notification_email"
                    type="email"
                    value={settings.notification_email}
                    onChange={(e) => updateSetting('notification_email', e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Режим обслуживания</Label>
                  <p className="text-sm text-gray-600">
                    Временно отключить сайт для обслуживания
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                />
              </div>

              {settings.maintenance_mode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenance_message">Сообщение о обслуживании</Label>
                  <Textarea
                    id="maintenance_message"
                    value={settings.maintenance_message}
                    onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                    placeholder="Сообщение, которое увидят пользователи"
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnostics Settings */}
        <TabsContent value="diagnostics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Параметры диагностики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_sessions">Максимум сессий на пользователя</Label>
                  <Input
                    id="max_sessions"
                    type="number"
                    value={settings.max_sessions_per_user}
                    onChange={(e) => updateSetting('max_sessions_per_user', parseInt(e.target.value))}
                    min="1"
                    max="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Время жизни сессии (минуты)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={settings.session_timeout}
                    onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                    min="5"
                    max="1440"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Режим отладки</Label>
                  <p className="text-sm text-gray-600">
                    Включить расширенное логирование
                  </p>
                </div>
                <Switch
                  checked={settings.debug_mode}
                  onCheckedChange={(checked) => updateSetting('debug_mode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Отчеты об ошибках</Label>
                  <p className="text-sm text-gray-600">
                    Автоматически отправлять отчеты об ошибках
                  </p>
                </div>
                <Switch
                  checked={settings.error_reporting}
                  onCheckedChange={(checked) => updateSetting('error_reporting', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>SMTP уведомления</Label>
                  <p className="text-sm text-gray-600">
                    Включить отправку email уведомлений
                  </p>
                </div>
                <Switch
                  checked={settings.smtp_enabled}
                  onCheckedChange={(checked) => updateSetting('smtp_enabled', checked)}
                />
              </div>

              {settings.smtp_enabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host">SMTP сервер</Label>
                      <Input
                        id="smtp_host"
                        value={settings.smtp_host}
                        onChange={(e) => updateSetting('smtp_host', e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">SMTP порт</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        value={settings.smtp_port}
                        onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_username">SMTP пользователь</Label>
                      <Input
                        id="smtp_username"
                        value={settings.smtp_username}
                        onChange={(e) => updateSetting('smtp_username', e.target.value)}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_password">SMTP пароль</Label>
                      <div className="relative">
                        <Input
                          id="smtp_password"
                          type={showPassword ? "text" : "password"}
                          value={settings.smtp_password}
                          onChange={(e) => updateSetting('smtp_password', e.target.value)}
                          placeholder="Пароль приложения"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки безопасности</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Разрешить регистрацию</Label>
                  <p className="text-sm text-gray-600">
                    Позволить новым пользователям регистрироваться
                  </p>
                </div>
                <Switch
                  checked={settings.allow_registration}
                  onCheckedChange={(checked) => updateSetting('allow_registration', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Подтверждение email</Label>
                  <p className="text-sm text-gray-600">
                    Требовать подтверждение email при регистрации
                  </p>
                </div>
                <Switch
                  checked={settings.require_email_verification}
                  onCheckedChange={(checked) => updateSetting('require_email_verification', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки внешнего вида</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default_theme">Тема по умолчанию</Label>
                <Select
                  value={settings.default_theme}
                  onValueChange={(value) => updateSetting('default_theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Светлая</SelectItem>
                    <SelectItem value="dark">Темная</SelectItem>
                    <SelectItem value="system">Системная</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Аналитика</Label>
                  <p className="text-sm text-gray-600">
                    Включить сбор анонимной аналитики
                  </p>
                </div>
                <Switch
                  checked={settings.analytics_enabled}
                  onCheckedChange={(checked) => updateSetting('analytics_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Резервное копирование</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Автоматическое резервное копирование</Label>
                  <p className="text-sm text-gray-600">
                    Создавать резервные копии автоматически
                  </p>
                </div>
                <Switch
                  checked={settings.auto_backup_enabled}
                  onCheckedChange={(checked) => updateSetting('auto_backup_enabled', checked)}
                />
              </div>

              {settings.auto_backup_enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backup_frequency">Частота копирования</Label>
                      <Select
                        value={settings.auto_backup_frequency}
                        onValueChange={(value) => updateSetting('auto_backup_frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Каждый час</SelectItem>
                          <SelectItem value="daily">Ежедневно</SelectItem>
                          <SelectItem value="weekly">Еженедельно</SelectItem>
                          <SelectItem value="monthly">Ежемесячно</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup_retention">Хранить копии (дни)</Label>
                      <Input
                        id="backup_retention"
                        type="number"
                        value={settings.backup_retention_days}
                        onChange={(e) => updateSetting('backup_retention_days', parseInt(e.target.value))}
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex space-x-2">
                <Button variant="outline" className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Создать резервную копию
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Восстановить из копии
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;

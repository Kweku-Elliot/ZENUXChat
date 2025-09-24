import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  ArrowLeft, 
  User, 
  Palette, 
  Bell, 
  Globe, 
  Shield, 
  BarChart3, 
  Info,
  ChevronRight,
  Download,
  Trash2,
  LogOut,
  Save,
  X
} from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

type SettingsView = 'main' | 'profile' | 'appearance' | 'notifications' | 'language' | 'privacy' | 'usage' | 'about';

export function Settings({ onBack }: SettingsProps) {
  const { user, settings, setSettings } = useApp();
  const { theme, setTheme } = useTheme();
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const settingsMenu = [
    {
      id: 'profile',
      icon: User,
      title: 'Profile Settings',
      description: 'Avatar, display name, bio',
      color: 'bg-primary',
    },
    {
      id: 'appearance',
      icon: Palette,
      title: 'Appearance & Theme',
      description: 'Light, dark, system themes',
      color: 'bg-secondary',
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'Push notifications, sounds',
      color: 'bg-accent',
    },
    {
      id: 'language',
      icon: Globe,
      title: 'Language & Region',
      description: 'Interface language, AI responses',
      color: 'bg-primary',
    },
    {
      id: 'privacy',
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Data controls, encryption',
      color: 'bg-destructive',
    },
    {
      id: 'usage',
      icon: BarChart3,
      title: 'Usage & Analytics',
      description: 'Detailed usage metrics',
      color: 'bg-secondary',
    },
    {
      id: 'about',
      icon: Info,
      title: 'About & Support',
      description: 'App info, help, documentation',
      color: 'bg-muted',
    },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const currencies = [
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];

  const handleSettingsUpdate = (key: string, value: any) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleProfileSave = () => {
    console.log('Saving profile:', profileForm);
    // TODO: Implement profile update API call
    setCurrentView('main');
  };

  const renderMainMenu = () => (
    <div className="space-y-4">
      {settingsMenu.map((item) => (
        <Glassmorphism
          key={item.id}
          className="p-4 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setCurrentView(item.id as SettingsView)}
          data-testid={`settings-${item.id}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Glassmorphism>
      ))}
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={profileForm.avatar} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <Button variant="outline" data-testid="button-change-avatar">
          Change Avatar
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={profileForm.displayName}
            onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
            placeholder="Enter your display name"
            data-testid="input-display-name"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profileForm.bio}
            onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself"
            rows={3}
            data-testid="input-bio"
          />
        </div>

        <div>
          <Label>Email (Read-only)</Label>
          <Input
            value={user?.email || ''}
            disabled
            className="bg-muted text-muted-foreground"
            data-testid="input-email-readonly"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <Button 
          onClick={handleProfileSave}
          className="flex-1"
          data-testid="button-save-profile"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button 
          variant="outline"
          onClick={() => setCurrentView('main')}
          data-testid="button-cancel-profile"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-4 block">Theme</Label>
        <div className="space-y-3">
          {(['light', 'dark', 'system'] as const).map((themeOption) => (
            <div
              key={themeOption}
              className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                theme === themeOption ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
              }`}
              onClick={() => setTheme(themeOption)}
              data-testid={`theme-${themeOption}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{themeOption}</span>
                {theme === themeOption && (
                  <div className="w-4 h-4 bg-primary rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={settings.currency}
          onValueChange={(value) => handleSettingsUpdate('currency', value)}
        >
          <SelectTrigger data-testid="select-currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Master Toggle</Label>
          <p className="text-sm text-muted-foreground">Enable all notifications</p>
        </div>
        <Switch
          checked={settings.notifications.enabled}
          onCheckedChange={(checked) =>
            handleSettingsUpdate('notifications', { ...settings.notifications, enabled: checked })
          }
          data-testid="switch-notifications-master"
        />
      </div>

      <div className="space-y-4 opacity-50">
        <div className="flex items-center justify-between">
          <div>
            <Label>Message Notifications</Label>
            <p className="text-sm text-muted-foreground">New chat messages</p>
          </div>
          <Switch disabled />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Transaction Alerts</Label>
            <p className="text-sm text-muted-foreground">Payment confirmations</p>
          </div>
          <Switch disabled />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Sounds</Label>
            <p className="text-sm text-muted-foreground">Notification sounds</p>
          </div>
          <Switch disabled />
        </div>
      </div>

      <p className="text-sm text-muted-foreground italic">
        Additional notification settings coming soon
      </p>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="interface-language">Interface Language</Label>
        <Select
          value={settings.language}
          onValueChange={(value) => handleSettingsUpdate('language', value)}
        >
          <SelectTrigger data-testid="select-interface-language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          Changes app interface language
        </p>
      </div>

      <div>
        <Label htmlFor="ai-language">AI Response Language</Label>
        <Select defaultValue="en">
          <SelectTrigger data-testid="select-ai-language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          Language for AI responses
        </p>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Data Collection</Label>
          <p className="text-sm text-muted-foreground">Help improve the app with usage data</p>
        </div>
        <Switch
          checked={settings.privacy.dataCollection}
          onCheckedChange={(checked) =>
            handleSettingsUpdate('privacy', { ...settings.privacy, dataCollection: checked })
          }
          data-testid="switch-data-collection"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">End-to-End Encryption</Label>
          <p className="text-sm text-muted-foreground">Encrypt messages and transactions</p>
        </div>
        <Switch
          checked={settings.privacy.encryptionEnabled}
          onCheckedChange={(checked) =>
            handleSettingsUpdate('privacy', { ...settings.privacy, encryptionEnabled: checked })
          }
          data-testid="switch-encryption"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Post-Quantum Encryption</Label>
          <p className="text-sm text-muted-foreground">Advanced quantum-resistant security</p>
        </div>
        <Switch
          checked={settings.privacy.postQuantumEnabled}
          onCheckedChange={(checked) =>
            handleSettingsUpdate('privacy', { ...settings.privacy, postQuantumEnabled: checked })
          }
          data-testid="switch-post-quantum"
        />
      </div>

      <div className="pt-4 border-t space-y-3">
        <Button variant="outline" className="w-full" data-testid="button-export-data">
          <Download className="w-4 h-4 mr-2" />
          Export My Data
        </Button>
        <Button variant="outline" className="w-full text-destructive" data-testid="button-delete-account">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </div>
    </div>
  );

  const renderUsageSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{user?.plan.messagesUsed || 0}</div>
            <div className="text-sm text-muted-foreground">Messages Sent</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{user?.plan.filesUploaded || 0}</div>
            <div className="text-sm text-muted-foreground">Files Uploaded</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{user?.plan.voiceMinutesUsed || 0}</div>
            <div className="text-sm text-muted-foreground">Voice Minutes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{user?.plan.apiCallsUsed || 0}</div>
            <div className="text-sm text-muted-foreground">API Calls</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Messages</span>
            <span>{user?.plan.messagesUsed || 0}/{user?.plan.messagesLimit || 50}</span>
          </div>
          <Progress value={((user?.plan.messagesUsed || 0) / (user?.plan.messagesLimit || 50)) * 100} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>File Uploads</span>
            <span>{user?.plan.filesUploaded || 0}/{user?.plan.filesLimit || 2}</span>
          </div>
          <Progress value={((user?.plan.filesUploaded || 0) / (user?.plan.filesLimit || 2)) * 100} />
        </div>

        {user?.plan.hasVoiceChat && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Voice Minutes</span>
              <span>{user.plan.voiceMinutesUsed}/{user.plan.voiceMinutesLimit}</span>
            </div>
            <Progress value={(user.plan.voiceMinutesUsed / user.plan.voiceMinutesLimit) * 100} />
          </div>
        )}
      </div>
    </div>
  );

  const renderAboutSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Zenux AI</h3>
          <p className="text-sm text-muted-foreground mb-4">Version 1.0.0</p>
          <p className="text-sm">Your intelligent AI assistant with offline capabilities</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="text-sm">
          <strong>Key Features:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Advanced AI chat with GPT-5</li>
            <li>Offline transaction validation</li>
            <li>Post-quantum encryption</li>
            <li>Voice interactions</li>
            <li>Image & video generation</li>
            <li>Group wallets & P2P payments</li>
          </ul>
        </div>

        <div className="text-sm">
          <strong>Tech Stack:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>React + TypeScript</li>
            <li>Express.js + Node.js</li>
            <li>Supabase Database</li>
            <li>OpenAI GPT-5</li>
            <li>Stripe Payments</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        <Button variant="outline" className="w-full" data-testid="button-documentation">
          <Info className="w-4 h-4 mr-2" />
          Documentation
        </Button>
        <Button variant="outline" className="w-full" data-testid="button-support">
          <Shield className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return renderProfileSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'language':
        return renderLanguageSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'usage':
        return renderUsageSettings();
      case 'about':
        return renderAboutSettings();
      default:
        return renderMainMenu();
    }
  };

  const getCurrentTitle = () => {
    const menuItem = settingsMenu.find(item => item.id === currentView);
    return menuItem ? menuItem.title : 'Settings';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            {currentView !== 'main' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('main')}
                data-testid="button-back-to-main"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">{getCurrentTitle()}</h1>
          <p className="text-muted-foreground">
            {currentView === 'main' 
              ? 'Manage your account and preferences'
              : 'Customize your settings'
            }
          </p>
        </div>

        {/* Content */}
        {renderCurrentView()}

        {/* Quick Actions (only on main view) */}
        {currentView === 'main' && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-export-chats"
              >
                <Download className="w-4 h-4 mr-3" />
                Export Chat History
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-clear-chats"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Clear All Chats
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                data-testid="button-sign-out"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;

'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, Heart, Monitor, Moon, Sun, User, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { useAuth } from '@/lib/contexts/auth-context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const currentTheme = theme ?? 'system';
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Sobre o app e configurações</p>
          </div>

          {/* User Profile */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Perfil do Usuário</CardTitle>
                <CardDescription>Informações da sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Timezone</span>
                    <span className="text-foreground">{user.timezone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Membro desde</span>
                    <span className="text-foreground">
                      {format(new Date(user.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-4"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tema</CardTitle>
              <CardDescription>Escolha entre claro, escuro ou automático pelo sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={currentTheme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4 mr-2" /> Claro
              </Button>
              <Button
                type="button"
                size="sm"
                variant={currentTheme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4 mr-2" /> Escuro
              </Button>
              <Button
                type="button"
                size="sm"
                variant={currentTheme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
              >
                <Monitor className="h-4 w-4 mr-2" /> Sistema
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <CardTitle>Habit System</CardTitle>
                <CardDescription>Sistema de rastreamento de hábitos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Versão</span>
              <Badge variant="secondary">1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Frontend</span>
              <span className="text-foreground">Next.js 16 + React 19</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Backend</span>
              <span className="text-foreground">.NET 9 + SQLite</span>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Funcionalidades</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-foreground">
                <span className="text-green-400">✓</span>
                <span>Autenticação JWT</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <span className="text-green-400">✓</span>
                <span>Criar e gerenciar hábitos diários</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <span className="text-green-400">✓</span>
                <span>Check-ins com status (Feito, Parcial, Pulado)</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <span className="text-green-400">✓</span>
                <span>Sistema de pontuação (score)</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <span className="text-green-400">✓</span>
                <span>Visualização de progresso semanal</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <span className="text-green-400">✓</span>
                <span>Estatísticas e análises</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <span className="text-green-400">✓</span>
                <span>Tema claro e escuro</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <span>○</span>
                <span>Notificações (em breve)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <GitBranch className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">Repositório no GitHub</span>
            </a>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p className="flex items-center justify-center gap-1">
            Feito com <Heart className="h-4 w-4 text-red-400" /> para ajudar você a criar bons hábitos
          </p>
        </div>
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}

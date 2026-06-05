'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GitBranch, Heart, Monitor, Moon, Sun, User, LogOut, Lock, Trash2, Crown, ShieldCheck, ShieldOff } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { useAuth } from '@/lib/contexts/auth-context';
import { authService } from '@/lib/api/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const currentTheme = theme ?? 'system';
  const { user, logout, refreshUser } = useAuth();

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState('');
  const [changePwSuccess, setChangePwSuccess] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Resend verification state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError('');
    if (newPassword.length < 8) {
      setChangePwError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setChangePwError('As senhas não coincidem.');
      return;
    }
    setChangePwLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setChangePwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowChangePassword(false);
    } catch {
      setChangePwError('Senha atual incorreta ou erro ao alterar.');
    } finally {
      setChangePwLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await authService.deleteAccount({ password: deletePassword });
      logout();
    } catch {
      setDeleteError('Senha incorreta. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await authService.resendVerification();
      setResendSent(true);
    } catch {
      // noop
    } finally {
      setResendLoading(false);
    }
  };

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
                    <div className="flex items-center gap-2 mt-1">
                      {user.isEmailVerified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <ShieldCheck className="h-3 w-3" /> E-mail verificado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <ShieldOff className="h-3 w-3" /> E-mail não verificado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email verification banner */}
                {!user.isEmailVerified && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-3 text-sm">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      Verifique seu e-mail para garantir acesso contínuo à sua conta.
                    </p>
                    {resendSent ? (
                      <p className="text-green-700 dark:text-green-400 mt-1 font-medium">E-mail enviado! Verifique sua caixa de entrada.</p>
                    ) : (
                      <button
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="mt-1 text-yellow-700 dark:text-yellow-300 underline underline-offset-2 hover:no-underline disabled:opacity-50"
                      >
                        {resendLoading ? 'Enviando...' : 'Reenviar e-mail de verificação'}
                      </button>
                    )}
                  </div>
                )}

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

          {/* Plan */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Plano
                </CardTitle>
                <CardDescription>Seu plano atual e limites</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">
                    {user.plan === 'Pro' ? 'Arco Pro' : 'Arco Free'}
                  </span>
                  {user.plan === 'Pro' ? (
                    <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pro</Badge>
                  ) : (
                    <Badge variant="secondary">Free</Badge>
                  )}
                </div>
                {user.plan === 'Free' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium">Plano Free: até 5 hábitos ativos</p>
                    <p className="mt-1 text-blue-600 dark:text-blue-300">
                      Faça upgrade para o Pro e tenha hábitos ilimitados.
                    </p>
                  </div>
                )}
                {user.plan === 'Pro' && (
                  <p className="text-sm text-muted-foreground">Hábitos ilimitados e todos os recursos premium.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>Gerencie sua senha</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {changePwSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg text-sm">
                  Senha alterada com sucesso!
                </div>
              )}

              {!showChangePassword ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowChangePassword(true); setChangePwSuccess(false); }}
                >
                  Alterar senha
                </Button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  {changePwError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
                      {changePwError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Senha atual</label>
                    <Input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nova senha</label>
                    <Input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Confirmar nova senha</label>
                    <Input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={changePwLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {changePwLoading ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setShowChangePassword(false); setChangePwError(''); }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

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
                <img
                  src="/icone.svg"
                  alt="Arco"
                  className="w-12 h-12 rounded-xl"
                />
                <div>
                  <CardTitle>Arco</CardTitle>
                  <CardDescription>Sistema de rastreamento de hábitos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Versão</span>
                <Badge variant="secondary">1.3.0</Badge>
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

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>Ações irreversíveis para sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Excluir minha conta
                </Button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-3">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium">Esta ação é permanente e irreversível.</p>
                    <p className="mt-1">Todos os seus hábitos, check-ins e dados serão excluídos.</p>
                  </div>
                  {deleteError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
                      {deleteError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Digite sua senha para confirmar
                    </label>
                    <Input
                      type="password"
                      required
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Sua senha atual"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="destructive" size="sm" disabled={deleteLoading}>
                      {deleteLoading ? 'Excluindo...' : 'Confirmar exclusão'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); setDeletePassword(''); }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
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

/**
 * Erros da API e tradução para mensagens pt-BR.
 *
 * O backend responde erros como `{ error: string, code?: string }`. A mensagem
 * original (em inglês) fica em `ApiError.message` apenas para depuração — a UI
 * deve sempre usar `getErrorMessage()` e nunca exibir o texto cru do backend.
 */

export type ApiErrorCode =
  | 'invalid_credentials'
  | 'email_taken'
  | 'checkin_exists'
  | 'not_found'
  | 'validation'
  | 'session_expired'
  | 'network'
  | (string & {});

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: ApiErrorCode;

  constructor(message: string, status?: number, code?: ApiErrorCode) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export const DEFAULT_ERROR_MESSAGE = 'Algo deu errado. Tente novamente.';

const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_taken: 'Este e-mail já está cadastrado.',
  checkin_exists: 'Já existe um check-in para este hábito neste dia.',
  not_found: 'Não encontramos o que você procurava.',
  validation: 'Verifique os dados informados e tente novamente.',
  session_expired: 'Sua sessão expirou. Entre novamente.',
  network: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
};

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Verifique os dados informados e tente novamente.',
  401: 'Sua sessão expirou. Entre novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Não encontramos o que você procurava.',
  409: 'Este registro já existe.',
  429: 'Muitas tentativas. Aguarde um minuto.',
};

/**
 * Sobrescritas por contexto: chaves podem ser um `code` do backend ou um status HTTP.
 * Ex.: `getErrorMessage(err, { 401: 'Senha atual incorreta.' })`.
 */
export type ErrorMessageOverrides = Partial<Record<string | number, string>>;

export function getErrorMessage(error: unknown, overrides: ErrorMessageOverrides = {}): string {
  if (!isApiError(error)) return DEFAULT_ERROR_MESSAGE;

  const { code, status } = error;

  if (code && overrides[code]) return overrides[code]!;
  if (status !== undefined && overrides[status]) return overrides[status]!;
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];
  if (status !== undefined) {
    if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
    if (status >= 500) return 'O servidor encontrou um problema. Tente novamente em instantes.';
  }

  return DEFAULT_ERROR_MESSAGE;
}

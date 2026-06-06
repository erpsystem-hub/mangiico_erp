import { txt } from '@/lib/text';

export interface AuthErrorLike {
  message?: string;
  code?: string;
  status?: number;
}

export type SignInErrorContext = {
  /** Đã có hồ sơ nhân viên khớp tên đăng nhập */
  employeeExists?: boolean;
};

function normalizeCode(error: AuthErrorLike): string {
  return (error.code ?? '').trim().toLowerCase();
}

function normalizeMessage(error: AuthErrorLike): string {
  return (error.message ?? '').trim().toLowerCase();
}

/** Map lỗi Supabase Auth khi đăng nhập → tiếng Việt. */
export function resolveSignInAuthError(
  error: AuthErrorLike,
  context: SignInErrorContext = {},
): string {
  const code = normalizeCode(error);
  const msg = normalizeMessage(error);

  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return txt('page.login.errorEmailNotConfirmed');
  }
  if (code === 'user_banned' || msg.includes('user is banned') || msg.includes('banned')) {
    return txt('page.login.errorAccountBanned');
  }
  if (
    code === 'over_request_rate_limit' ||
    msg.includes('too many requests') ||
    msg.includes('rate limit')
  ) {
    return txt('page.login.errorTooManyRequests');
  }
  if (
    code === 'validation_failed' ||
    msg.includes('invalid format') ||
    msg.includes('unable to validate email')
  ) {
    return txt('page.login.errorInvalidUsername');
  }

  const isInvalidCredentials =
    code === 'invalid_credentials' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials');

  if (isInvalidCredentials) {
    if (context.employeeExists === false) {
      return txt('page.login.errorAccountNotFound');
    }
    return txt('page.login.errorWrongPassword');
  }

  return txt('page.login.errorGeneric');
}

/** Map lỗi Auth chung (đăng ký, đổi mật khẩu, …). */
export function resolveAuthErrorMessage(error: AuthErrorLike): string {
  const code = normalizeCode(error);
  const msg = normalizeMessage(error);

  if (code === 'weak_password' || msg.includes('weak password') || msg.includes('password should')) {
    return txt('page.login.errorWeakPassword');
  }
  if (code === 'same_password' || msg.includes('same password')) {
    return txt('nav.changePassword.errorSamePassword');
  }
  if (msg.includes('already') && (msg.includes('registered') || msg.includes('exists'))) {
    return txt('page.login.errorAccountExists');
  }

  return resolveSignInAuthError(error);
}

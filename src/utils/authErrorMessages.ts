type FirebaseLikeError = {
  code?: string;
  message?: string;
};

const fallbackMessage = 'Não foi possível concluir a ação.\nTente novamente em alguns instantes.';

function getFirebaseCode(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const { code, message } = error as FirebaseLikeError;

    if (code) return code;

    const codeMatch = message?.match(/\((auth\/[^)]+)\)/);
    if (codeMatch) return codeMatch[1];
  }

  return '';
}

export function getAuthErrorMessage(error: unknown, fallback = fallbackMessage) {
  const code = getFirebaseCode(error);

  switch (code) {
    case 'auth/too-many-requests':
      return 'Muitas tentativas em pouco tempo.\nAguarde alguns minutos antes de tentar novamente.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha inválidos.\nVerifique os dados e tente novamente.';
    case 'auth/invalid-email':
      return 'O e-mail informado não parece válido.\nRevise o campo e tente novamente.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está sendo utilizado por outra conta.\nUse outro e-mail ou acesse sua conta.';
    case 'auth/weak-password':
      return 'A senha precisa ser mais segura.\nUse pelo menos 8 caracteres.';
    case 'auth/network-request-failed':
      return 'Não foi possível conectar ao Firebase.\nConfira sua conexão e tente novamente.';
    case 'auth/popup-closed-by-user':
      return 'O login com Google foi cancelado.\nTente novamente quando quiser.';
    case 'auth/requires-recent-login':
      return 'Por segurança, entre novamente na sua conta.\nDepois tente alterar esses dados outra vez.';
    default:
      return fallback.replaceAll('. ', '.\n');
  }
}

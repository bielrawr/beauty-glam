type FirebaseLikeError = {
  code?: string;
  message?: string;
};

const fallbackMessage = 'Não foi possível concluir a ação.\nTente novamente em alguns instantes.';

function getCurrentHostname() {
  if (typeof window === 'undefined' || !window.location.hostname) return '';
  return ` (${window.location.hostname})`;
}

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
    case 'auth/loopback-ip-not-authorized':
      return 'O login com Google local precisa abrir por localhost.\nTroque 127.0.0.1 por localhost na barra do navegador ou adicione 127.0.0.1 nos dominios autorizados do Firebase.';
    case 'auth/unauthorized-domain':
      return `Este dominio${getCurrentHostname()} nao esta autorizado no Firebase.\nAdicione esse dominio em Authentication > Settings > Authorized domains.`;
    case 'auth/operation-not-allowed':
      return 'O login com Google não está habilitado no Firebase.\nAtive o provedor Google em Authentication > Sign-in method.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela do Google.\nPermita pop-ups para este site e tente novamente.';
    case 'auth/popup-closed-by-user':
      return 'O login com Google foi cancelado.\nTente novamente quando quiser.';
    case 'auth/cancelled-popup-request':
      return 'Uma tentativa de login com Google já estava em andamento.\nFeche outras janelas de login e tente novamente.';
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta com este e-mail usando outro tipo de login.\nEntre pelo método usado anteriormente.';
    case 'auth/configuration-not-found':
      return 'A configuração do Firebase Authentication não foi encontrada.\nConfira o projeto Firebase usado pelo app.';
    case 'permission-denied':
      return 'O login foi aceito, mas o perfil não pôde ser acessado no Firestore.\nConfira as regras de segurança do banco.';
    case 'unavailable':
      return 'O Firebase ficou indisponível ao carregar seus dados.\nTente novamente em instantes.';
    case 'auth/requires-recent-login':
      return 'Por segurança, entre novamente na sua conta.\nDepois tente alterar esses dados outra vez.';
    default:
      return fallback.replaceAll('. ', '.\n');
  }
}

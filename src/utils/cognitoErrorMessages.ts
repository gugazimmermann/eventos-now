export const cognitoErrorMap: Record<string, string> = {
  UserNotFoundException: "Usuário não encontrado",
  NotAuthorizedException: "E-mail ou senha incorretos",
  UserNotConfirmedException: "Usuário ainda não confirmou o cadastro",
  PasswordResetRequiredException: "É necessário redefinir a senha antes de fazer login",
  TooManyFailedAttemptsException: "Muitas tentativas falhas. Tente novamente mais tarde",
  InvalidParameterException: "Parâmetros inválidos. Verifique os dados informados",
  CodeMismatchException: "Código informado está incorreto",
  ExpiredCodeException: "O código informado expirou",
  LimitExceededException: "Limite de tentativas excedido. Tente novamente mais tarde",
  UserLambdaValidationException: "Falha na validação do usuário. Verifique seus dados",
  InvalidPasswordException: "A senha informada não atende aos requisitos de segurança",
};

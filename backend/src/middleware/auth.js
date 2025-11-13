// Middleware simple d'authentification
// Pour une version de production, utilisez JWT ou sessions
module.exports = (req, res, next) => {
  // Pour le développement, on simule un utilisateur connecté
  // En production, vérifiez le token JWT ici
  const userId = req.headers['x-user-id'] || 1;
  req.userId = parseInt(userId);
  next();
};

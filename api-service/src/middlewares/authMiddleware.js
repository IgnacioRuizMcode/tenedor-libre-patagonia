exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.email === process.env.ADMIN_EMAIL) {
    return next();
  }
  res.status(403).json({ message: 'Acceso denegado. Solo para administradores.' });
};
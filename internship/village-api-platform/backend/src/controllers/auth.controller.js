const authService = require('../services/auth.service');
const { success, created } = require('../utils/response');

const register = async (req, res) => {
  const result = await authService.register(req.body);
  return created(res, result);
};

const login = async (req, res) => {
  const result = await authService.login(req.body);
  return success(res, result);
};

const refresh = async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  return success(res, result);
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);
  return success(res, { message: 'Logged out successfully' });
};

const getProfile = async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  return success(res, user);
};

const updateProfile = async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  return success(res, user);
};

const changePassword = async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  return success(res, { message: 'Password changed successfully' });
};

module.exports = { register, login, refresh, logout, getProfile, updateProfile, changePassword };

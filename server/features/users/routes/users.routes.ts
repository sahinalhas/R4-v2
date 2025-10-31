import { Request, Response } from 'express';
import * as service from '../services/users.service.js';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'E-posta ve şifre gereklidir' 
      });
    }

    const result = await service.login({ email, password });
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Giriş işlemi sırasında bir hata oluştu' 
    });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { name, email, password, role, institution } = req.body;

    if (!name || !email || !password || !role || !institution) {
      return res.status(400).json({ 
        success: false,
        error: 'Tüm alanlar gereklidir' 
      });
    }

    const result = await service.createUser({ name, email, password, role, institution });
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Create user route error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Kullanıcı oluşturulurken bir hata oluştu' 
    });
  }
}

export function getAllUsers(req: Request, res: Response) {
  try {
    const users = service.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get all users route error:', error);
    res.status(500).json({ error: 'Kullanıcılar alınırken bir hata oluştu' });
  }
}

export function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Kullanıcı ID gereklidir' });
    }

    const user = service.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by id route error:', error);
    res.status(500).json({ error: 'Kullanıcı alınırken bir hata oluştu' });
  }
}

export async function updateUserPassword(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!id || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Kullanıcı ID ve yeni şifre gereklidir' 
      });
    }

    const result = await service.updateUserPassword(id, newPassword);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Update password route error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Şifre güncellenirken bir hata oluştu' 
    });
  }
}

export function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, role, institution } = req.body;

    if (!id || !name || !email || !role || !institution) {
      return res.status(400).json({ 
        success: false,
        error: 'Tüm alanlar gereklidir' 
      });
    }

    const result = service.updateUser(id, name, email, role, institution);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Update user route error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Kullanıcı güncellenirken bir hata oluştu' 
    });
  }
}

export function deactivateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Kullanıcı ID gereklidir' 
      });
    }

    const result = service.deactivateUser(id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Deactivate user route error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Kullanıcı silinirken bir hata oluştu' 
    });
  }
}

export function getUsersCount(req: Request, res: Response) {
  try {
    const count = service.countUsers();
    res.json({ count });
  } catch (error) {
    console.error('Get users count route error:', error);
    res.status(500).json({ error: 'Kullanıcı sayısı alınırken bir hata oluştu' });
  }
}

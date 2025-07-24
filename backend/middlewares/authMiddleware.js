const jwt = require("jsonwebtoken");
const prisma = require("../config/prismaClient");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

// Middleware để kiểm tra user role (bao gồm cả USER và ADMIN)
const user = (req, res, next) => {
  if (req.user && (req.user.role === "USER" || req.user.role === "ADMIN")) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as a user" });
  }
};

// Middleware để kiểm tra permission cụ thể
const requirePermission = (permissionType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Admin có tất cả permissions
      if (req.user.role === "ADMIN") {
        return next();
      }

      // Kiểm tra permission cụ thể
      const rolePermission = await prisma.rolePermission.findFirst({
        where: {
          role: req.user.role,
          permission: {
            name: permissionType,
          },
        },
        include: {
          permission: true,
        },
      });

      if (!rolePermission) {
        return res.status(403).json({
          message: `Not authorized. Required permission: ${permissionType}`,
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({ message: "Server error during permission check" });
    }
  };
};

// Middleware để kiểm tra nhiều roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { protect, admin, user, requirePermission, requireRole };

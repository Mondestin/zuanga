import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import driversRoutes from './drivers.routes';
import schoolsRoutes from './schools.routes';
import ridesRoutes from './rides.routes';
import routesRoutes from './routes.routes';
import trackingRoutes from './tracking.routes';
import subscriptionsRoutes from './subscriptions.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check routes
router.use(healthRoutes);

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', usersRoutes);

// Driver routes
router.use('/drivers', driversRoutes);

// School routes
router.use('/schools', schoolsRoutes);

// Ride routes
router.use('/rides', ridesRoutes);

// Route routes
router.use('/routes', routesRoutes);

// Tracking routes
router.use('/tracking', trackingRoutes);

// Subscription routes
router.use('/subscriptions', subscriptionsRoutes);

// Admin routes
router.use('/admin', adminRoutes);

export default router;


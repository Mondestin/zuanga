import { Router } from 'express';
import { SchoolController } from '../../controllers/school.controller';
import { authenticate, loadUser, requireRole } from '../../auth/middleware';
import { validate } from '../../middleware/validator';
import { createSchoolSchema, updateSchoolSchema } from '../../validators/school.validator';
import { UserRole } from '../../models/User';

const router = Router();

/**
 * List all schools
 * GET /api/v1/schools
 */
router.get('/', SchoolController.getSchools);

/**
 * Get school by ID
 * GET /api/v1/schools/:id
 */
router.get('/:id', SchoolController.getSchoolById);

/**
 * Create school (admin or parent)
 * POST /api/v1/schools
 */
router.post('/', authenticate, loadUser, requireRole(UserRole.ADMIN, UserRole.PARENT), validate(createSchoolSchema), SchoolController.createSchool);

/**
 * Update school (admin or parent)
 * PUT /api/v1/schools/:id
 */
router.put('/:id', authenticate, loadUser, requireRole(UserRole.ADMIN, UserRole.PARENT), validate(updateSchoolSchema), SchoolController.updateSchool);

/**
 * Delete school (admin or parent - soft delete)
 * DELETE /api/v1/schools/:id
 */
router.delete('/:id', authenticate, loadUser, requireRole(UserRole.ADMIN, UserRole.PARENT), SchoolController.deleteSchool);

export default router;

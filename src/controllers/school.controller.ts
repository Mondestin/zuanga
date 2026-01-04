import { Request, Response } from 'express';
import { SchoolService } from '../services/school.service';
import { CreateSchoolInput, UpdateSchoolInput } from '../models/School';

/**
 * School Controller
 * Handles HTTP requests/responses for school endpoints
 */
export class SchoolController {
  /**
   * List all schools
   * GET /api/v1/schools
   */
  static async getSchools(req: Request, res: Response): Promise<void> {
    try {
      const activeOnly = req.query.active !== 'false';
      const schools = await SchoolService.getSchools(activeOnly);

      res.json({
        success: true,
        data: {
          schools,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get schools';
      res.status(500).json({
        success: false,
        error: {
          message,
          statusCode: 500,
        },
      });
    }
  }

  /**
   * Get school by ID
   * GET /api/v1/schools/:id
   */
  static async getSchoolById(req: Request, res: Response): Promise<void> {
    try {
      const school = await SchoolService.getSchoolById(req.params.id);

      res.json({
        success: true,
        data: {
          school,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get school';
      const statusCode = message.includes('not found') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message,
          statusCode,
        },
      });
    }
  }

  /**
   * Create school (admin or parent)
   * POST /api/v1/schools
   */
  static async createSchool(req: Request, res: Response): Promise<void> {
    try {
      const schoolInput: CreateSchoolInput = {
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country || 'US',
        postal_code: req.body.postal_code,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
      };

      const school = await SchoolService.createSchool(schoolInput);

      res.status(201).json({
        success: true,
        data: {
          school,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create school';
      res.status(500).json({
        success: false,
        error: {
          message,
          statusCode: 500,
        },
      });
    }
  }

  /**
   * Update school (admin or parent)
   * PUT /api/v1/schools/:id
   */
  static async updateSchool(req: Request, res: Response): Promise<void> {
    try {
      const updateData: UpdateSchoolInput = req.body;
      const school = await SchoolService.updateSchool(req.params.id, updateData);

      res.json({
        success: true,
        data: {
          school,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update school';
      const statusCode = message.includes('not found') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message,
          statusCode,
        },
      });
    }
  }

  /**
   * Delete school (admin or parent - soft delete)
   * DELETE /api/v1/schools/:id
   */
  static async deleteSchool(req: Request, res: Response): Promise<void> {
    try {
      await SchoolService.deleteSchool(req.params.id);

      res.json({
        success: true,
        message: 'School deleted successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete school';
      res.status(500).json({
        success: false,
        error: {
          message,
          statusCode: 500,
        },
      });
    }
  }
}


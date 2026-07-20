import { BadRequestException, Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { diskStorage } from 'multer';

import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { IMPORTS_DIR, ImportsService } from './imports.service';

const ALLOWED_EXTENSIONS = new Set(['.epub', '.pdf']);
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

@ApiBearerAuth()
@ApiTags('imports')
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @ApiBody({
    schema: {
      properties: { file: { format: 'binary', type: 'string' } },
      type: 'object',
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import file EPUB/PDF vào thư viện cá nhân (parse thành truyện + chương)',
  })
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
          callback(
            new BadRequestException('Chỉ hỗ trợ file .epub hoặc .pdf'),
            false,
          );
          return;
        }
        callback(null, true);
      },
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      storage: diskStorage({
        destination: IMPORTS_DIR,
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
        },
      }),
    }),
  )
  import(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.importsService.importFile(file, user, baseUrl);
  }
}

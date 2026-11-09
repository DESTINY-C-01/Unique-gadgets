import {
  BadRequestException, Controller, Get, NotFoundException, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import { AdminGuard } from '../common/admin.guard';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { Media } from './media.schema';

@Controller('media')
export class MediaController {
  constructor(@InjectModel(Media.name) private media: Model<Media>) {}

  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 3 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
      throw new BadRequestException('Upload a JPG, PNG or WebP image');
    }
    const doc = await this.media.create({ contentType: file.mimetype, data: file.buffer });
    return { path: `/media/${doc._id}` };
  }

  @Get(':id')
  async get(@Param('id', ParseObjectIdPipe) id: string, @Res() res: Response) {
    const doc = await this.media.findById(id);
    if (!doc) throw new NotFoundException();
    res.set({
      'Content-Type': doc.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    res.send(doc.data);
  }
}

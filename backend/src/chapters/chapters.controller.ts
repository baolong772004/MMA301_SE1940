import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ChaptersService } from './chapters.service';
import { CreateCommentDto, UpdateChapterDto } from './dto';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('chapters')
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @ApiOperation({
    summary: 'Nội dung chương (VIP chưa mở khóa -> locked=true, content=null)',
  })
  @Get(':id')
  @Public()
  detail(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.chaptersService.detail(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật / auto-save nháp chương (tác giả)' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChapterDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chaptersService.update(id, dto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xuất bản chương (tác giả)' })
  @HttpCode(200)
  @Post(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.chaptersService.publish(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa chương (tác giả)' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.chaptersService.remove(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mở khóa chương VIP bằng xu' })
  @HttpCode(200)
  @Post(':id/unlock')
  unlock(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.chaptersService.unlock(id, user);
  }

  @ApiOperation({ summary: 'Danh sách inline comment của chương' })
  @Get(':id/comments')
  @Public()
  listComments(@Param('id') id: string) {
    return this.chaptersService.listComments(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bình luận inline vào đoạn văn (qua bộ lọc censor)' })
  @Post(':id/comments')
  createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chaptersService.createComment(id, dto, user);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SetShelfDto, UpsertProgressDto } from './dto';
import { LibraryService } from './library.service';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiBearerAuth()
@ApiTags('library')
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @ApiOperation({ summary: 'Thư viện cá nhân (nhóm theo kệ)' })
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.libraryService.list(user);
  }

  @ApiOperation({ summary: 'Danh sách đang đọc dở (continue reading)' })
  @Get('continue')
  continueReading(@CurrentUser() user: AuthUser) {
    return this.libraryService.continueReading(user);
  }

  @ApiOperation({ summary: 'Thêm/chuyển kệ truyện trong thư viện' })
  @Put(':storyId')
  setShelf(
    @Param('storyId') storyId: string,
    @Body() dto: SetShelfDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.libraryService.setShelf(storyId, dto.shelf, user);
  }

  @ApiOperation({ summary: 'Xóa truyện khỏi thư viện' })
  @Delete(':storyId')
  remove(@Param('storyId') storyId: string, @CurrentUser() user: AuthUser) {
    return this.libraryService.remove(storyId, user);
  }

  @ApiOperation({ summary: 'Vị trí đọc dở của một truyện' })
  @Get(':storyId/progress')
  getProgress(
    @Param('storyId') storyId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.libraryService.getProgress(storyId, user);
  }

  @ApiOperation({ summary: 'Lưu vị trí đọc dở (chapter + scroll position)' })
  @Put(':storyId/progress')
  upsertProgress(
    @Param('storyId') storyId: string,
    @Body() dto: UpsertProgressDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.libraryService.upsertProgress(
      storyId,
      dto.chapterId,
      dto.position,
      user,
    );
  }
}

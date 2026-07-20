import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CreateChapterDto,
  CreateStoryDto,
  RateStoryDto,
  StoryQueryDto,
  UpdateStoryDto,
} from './dto';
import { StoriesService } from './stories.service';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @ApiOperation({ summary: 'Danh sách truyện (tìm kiếm + bộ lọc)' })
  @Get()
  @Public()
  list(@Query() query: StoryQueryDto, @CurrentUser() user?: AuthUser) {
    return this.storiesService.list(query, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Truyện của tôi (Studio sáng tác)' })
  @Get('mine')
  listMine(@CurrentUser() user: AuthUser) {
    return this.storiesService.listMine(user);
  }

  @ApiOperation({ summary: 'Chi tiết truyện + danh sách chương' })
  @Get(':id')
  @Public()
  detail(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.storiesService.detail(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo truyện mới (tự lên vai trò WRITER)' })
  @Post()
  create(@Body() dto: CreateStoryDto, @CurrentUser() user: AuthUser) {
    return this.storiesService.create(dto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật truyện (tác giả)' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.storiesService.update(id, dto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa truyện (tác giả)' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.storiesService.remove(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm chương mới (tác giả)' })
  @Post(':id/chapters')
  createChapter(
    @Param('id') id: string,
    @Body() dto: CreateChapterDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.storiesService.createChapter(id, dto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đánh giá truyện 1-5 sao' })
  @Put(':id/rating')
  rate(
    @Param('id') id: string,
    @Body() dto: RateStoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.storiesService.rate(id, dto.stars, user);
  }
}

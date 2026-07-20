import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Hồ sơ công khai (followers/following/stories)' })
  @Get(':id')
  @Public()
  profile(@Param('id') id: string, @CurrentUser() viewer?: AuthUser) {
    return this.usersService.profile(id, viewer);
  }

  @ApiOperation({ summary: 'Truyện công khai của tác giả' })
  @Get(':id/stories')
  @Public()
  stories(@Param('id') id: string) {
    return this.usersService.stories(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Theo dõi tác giả' })
  @HttpCode(200)
  @Post(':id/follow')
  follow(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.follow(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bỏ theo dõi tác giả' })
  @Delete(':id/follow')
  unfollow(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.unfollow(id, user);
  }
}

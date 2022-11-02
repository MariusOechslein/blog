import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.interface';
import { map, catchError } from 'rxjs/operators';
import { hasRoles } from '../../auth/decorator/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-guard';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() user: User): Observable<User | unknown> {
    return this.userService.create(user).pipe(
      map((user: User) => user),
      catchError((err) => of({ error: err.message })),
    );
  }

  @Post('login')
  login(@Body() user: User): Observable<any | string> {
    return this.userService.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }

  @hasRoles(UserRole.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param() params): Observable<User> {
    return this.userService.findOne(params.id);
  }

  @hasRoles(UserRole.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  // findAll() with Pagination
  index(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;

    return this.userService.paginate({
      page: Number(page),
      limit: Number(limit),
      route: 'http://localhost:3000/users',
    });
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<any> {
    return this.userService.deleteOne(Number(id));
  }

  @Put(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updateOne(Number(id), user);
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() user: User,
  ): Observable<User> {
    return this.userService.updateUserRole(Number(id), user);
  }
}

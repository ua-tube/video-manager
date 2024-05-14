import { CanBeUndefined } from '../../common/decorators';
import { IsIn, IsString } from 'class-validator';

export class SortDto {
  @CanBeUndefined()
  @IsString()
  sortBy?: string

  @CanBeUndefined()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'
}

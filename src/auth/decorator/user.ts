import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { get } from 'lodash';

export const User = createParamDecorator(
  (data: string | string[] | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return get(request.user, data, request.user);
  },
);

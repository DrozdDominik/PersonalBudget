import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserObj = createParamDecorator((data, context: ExecutionContext) =>
    context.switchToHttp().getRequest().user
)
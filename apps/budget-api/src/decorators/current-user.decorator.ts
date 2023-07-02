import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: never, context: ExecutionContext) =>
    context.switchToHttp().getRequest().user
)
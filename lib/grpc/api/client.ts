import { createChannel, createClient } from 'nice-grpc';
import { env } from '@/config/env';
import { UserServiceDefinition } from '@/lib/generated/proto/medincident/v1/user';

const channel = createChannel(env.BACKEND_API_URL);

export const userService = createClient(UserServiceDefinition, channel);
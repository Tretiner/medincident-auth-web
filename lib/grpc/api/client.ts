import { createChannel, createClient } from 'nice-grpc';
import { UserServiceDefinition } from '@/lib/generated/proto/medincident/user/v1/service';
import { env } from '@/config/env';

const GRPC_SERVER_URL = env.BACKEND_API_URL;

const channel = createChannel(GRPC_SERVER_URL);
export const backendGrpcClient = createClient(UserServiceDefinition, channel);
import { User } from "@/domain/entities/user";

export class UserRepositoryImpl {
  async getById(id: string): Promise<User> {
    // Имитация задержки базы данных
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id,
      firstName: "Константин",
      lastName: "Константинопольский",
      email: "doctor@medsafety.ru",
      phone: "+79000000000",
      position: "Главный врач",
      avatarUrl: "https://github.com/shadcn.png"
    };
  }
}
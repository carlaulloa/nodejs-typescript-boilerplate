import { inject, injectable } from "inversify";
import { User } from "../../user/entities/user.entity";
import { AuthRepository } from "./auth.repository";
import { SERVICES_IDENTIFIERS } from "../../bootstrap/container.types";
import { CustomError } from "../../helper/errors.handler";
import { UserService } from "../../user/application/user.service";

@injectable()
export class AuthUsecase {
  constructor(
    @inject(SERVICES_IDENTIFIERS.AUTH_REPOSITORY)
    private readonly repository: AuthRepository
  ) {}

  async login(data: Partial<User>): Promise<any> {
    const { payload: user } = await this.repository.listOne({
      email: data.email,
    });
    if (!user.data) {
      throw new CustomError(404, "Usuario no encontrado.");
    }
    const isValidPassword = await UserService.validatePassword(
      user.data.password,
      data.password
    );
    if (!isValidPassword) {
      throw new CustomError(403, "Email o contraseña inválida.");
    }
    const accessToken = await UserService.generateAccessToken(user.data);
    return { accessToken, refreshToken: user.data.refreshToken };
  }

  async getNewAccessToken(data: Partial<User>): Promise<any> {
    const { payload: user } = await this.repository.listOne({
      refreshToken: data.refreshToken,
    });
    if (!user.data) {
      throw new CustomError(404, "Usuario no encontrado.");
    }
    const accessToken = await UserService.generateAccessToken(user.data);
    return { accessToken, refreshToken: user.data.refreshToken };
  }
}

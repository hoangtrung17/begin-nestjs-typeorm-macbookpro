
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service'
import { decode, encode } from 'jwt-simple';
@Injectable()
export class UsersService {

    constructor(@InjectModel('User') private readonly UserModel: Model<User>, private readonly Role: RolesService) { }

    async create(createUserDto: CreateUserDto): Promise<any> {
        const createdUser = new this.UserModel(createUserDto);
        return createdUser.save();
    }

    async findAll(): Promise<User[]> {
        return this.UserModel.find().exec();
    }

    async findOne(userName: string): Promise<any> {
        return this.UserModel.findOne({ email: userName }).exec();
    }

    async findOneById(id: string): Promise<User> {
        return this.UserModel.findOne({ _id: id }).exec();
    }

    async findByParam(param: any): Promise<any> {
        return this.UserModel.findOne(param).exec();
    }

    async deleteUser(userId: string) {
        return this.UserModel.deleteOne({ _id: userId }).exec();
    }

    async findOrCreate(_user): Promise<User> {
        const user = await this.UserModel
            .findOne({ 'email': _user.email })
            .exec();
        if (user) {
            return user;
        }
        let _role = null;
        if (_user.googleId || _user.facebookId) {
            _role = await this.Role.findByParam({roleName: "student"}).then(doc => {
                return doc._id
            })
        }
        let savedata = {
            name: _user.email,
            email: _user.email,
            password: _user.accessToken,
            googleId: _user.googleId ? _user.googleId : null,
            facebookId: _user.facebookId ? _user.facebookId : null,
            token: _user.accessToken,
            role_id: _role
        };

        const createdUser = new this.UserModel(savedata)
        return createdUser.save()
    }
}

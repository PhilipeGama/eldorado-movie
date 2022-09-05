import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import User from "../entity/user.entity";
import UserRepository from "../repository/user.repository";

class UserController {
    constructor(){}

    async postUser(request: Request, response: Response){
        const userRespository = getCustomRepository(UserRepository);
        let user = new User();
        user.name = request.body.name;
        user.email = request.body.email;
        user.password = request.body.password;

        userRespository.save(user).then(user => {
            return response.json(user);
        }).catch(error => {
            return response.json(error.sqlMessage);
        });
    }

    async getAllUsers(response: Response){
        const userRespository = getCustomRepository(UserRepository);
        const user = await userRespository.findAll();
        return response.status(201).json(user);
    }

    async putUser(request: Request, response: Response){
        const userRespository = getCustomRepository(UserRepository);

        const { id } = request.body

        let user = new User();
        user.name = request.body.name;
        user.email = request.body.email;
        user.password = request.body.password;

        userRespository.update(id, user).then(user => {
            return response.json(user);
        }).catch(error => {
            return response.json(error.sqlMessage);
        });
    }
}

export default new UserController;
import { Request, Response } from 'express';
import Movie from '../entity/movie.entity';

import { getCustomRepository } from 'typeorm';
import MovieRepository from '../repository/movie.repository';

import { unlink } from 'fs';
import path from 'path';
import { staticPath } from '../utils/path';

class MovieController {
	async getMovieByID(request: Request, response: Response) {
		const movieRepository = getCustomRepository(MovieRepository);
		const { id } = request.params;
		const movie = await movieRepository.findById(id);

		return response.json(movie);
	}

	async getMoviesPaginated(request: Request, response: Response) {
		const { page , limit } = request.query;
		const movieRepository = getCustomRepository(MovieRepository);
		const movies = await movieRepository.findMoviesPaginated(Number(page), Number(limit));
		const countMovies = await movieRepository.countMovies();

		return response.status(200).json({data: {movies, totItems: countMovies}});
	}

	async postMovie(request: Request, response: Response) {
		try {
			const movieRepository = getCustomRepository(MovieRepository);
			const movieAlreadyExists = await movieRepository.findByName(
				request.body.name
			);

			if (typeof movieAlreadyExists !== 'undefined') {
				return response.status(500).json({
					title: 'Um filme com o mesmo nome já existe no banco de dados!',
				});
			}

			const movie = new Movie();

			movie.name = request.body.name;
			movie.synopsis = request.body.synopsis;
			movie.trailer = request.body.trailer;
			movie.releaseDate = request.body.releaseDate;
			movie.boxOffice = request.body.boxOffice;
			movie.poster = request.body.poster;
			movie.gender = request.body.gender;

			await movieRepository
				.save(movie)
				.then(() => {
					return response.status(201).json({
						title: 'Filme cadastrado com sucesso!',
					});
				})
				.catch((error) => {
					return response.status(404).json({
						title: error.message,
					});
				});
		} catch (error) {
			return response.status(404).json({
				error: error.message,
			});
		}
	}

	public async putMovie(request: Request, response: Response) {
		try {
			const movieRepository = getCustomRepository(MovieRepository);
			const { id } = request.params;
			const movie = await movieRepository.findById(id);
			
			if (request.body.poster) {
				unlink(path.join(staticPath, movie.poster), (err) => {
					err;
				});
				movie.poster = request.body.poster;
			}

			movie.name = request.body.name;
			movie.synopsis = request.body.synopsis;
			movie.trailer = request.body.trailer;
			movie.releaseDate = request.body.releaseDate;
			movie.boxOffice = request.body.boxOffice;

			movie.gender = request.body.gender;

			delete movie.fullPath;

			movieRepository.update(id, movie);

			response.status(200).json({
				title: 'Filme atualizado com successo',
			});
		} catch (error) {
			return response.status(404).json({
				error: error.message,
			});
		}
		
	}

	public async deleteMovie(request: Request, response: Response) {
		try {
			const movieRepository = getCustomRepository(MovieRepository);
			const { id } = request.params;
			const movie = await movieRepository.findById(id);
	
			delete movie.fullPath;
	
			await movieRepository.delete({ id: movie.id }).then(() => {
				unlink(path.join(staticPath, movie.poster), (err) => {
					err;
				});
			});
	
			response.status(200).json({
				title: 'Filme deletado com sucesso',
			});
		} catch (error) {
			return response.status(404).json({
				error: error.message,
			});
		}

	}
}

export default new MovieController();

import {EvaluationsService} from './evaluations.service';
import {DatabaseService} from '../database/database.service';
import {DatabaseModule} from '../database/database.module';
import {Evaluation} from './evaluation.model';
import {EvaluationTagsModule} from '../evaluation-tags/evaluation-tags.module';
import {EvaluationTagsService} from '../evaluation-tags/evaluation-tags.service';
import {SequelizeModule} from '@nestjs/sequelize';
import {Test} from '@nestjs/testing';
import {NotFoundException} from '@nestjs/common';
import {
  EVALUATION,
  UPDATE_EVALUATION,
  EVALUATION_WITH_TAGS_1,
  CREATE_EVALUATION_DTO_WITHOUT_TAGS,
  CREATE_EVALUATION_DTO_WITHOUT_DATA,
  CREATE_EVALUATION_DTO_WITHOUT_VERSION,
  UPDATE_EVALUATION_VERSION_ONLY,
  UPDATE_EVALUATION_DATA_ONLY,
  UPDATE_EVALUATION_ADD_TAGS_1,
  UPDATE_EVALUATION_REMOVE_TAGS_1
} from '../../test/constants/evaluations-test.constant';
import {UpdateEvaluationTagDto} from '../evaluation-tags/dto/update-evaluation-tag.dto';
import {UpdateEvaluationDto} from './dto/update-evaluation.dto';

describe('EvaluationsService', () => {
  let evaluationsService: EvaluationsService;
  let evaluationTagsService: EvaluationTagsService;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        SequelizeModule.forFeature([Evaluation]),
        EvaluationTagsModule
      ],
      providers: [EvaluationsService, DatabaseService]
    }).compile();

    evaluationsService = module.get<EvaluationsService>(EvaluationsService);
    evaluationTagsService = module.get<EvaluationTagsService>(
      EvaluationTagsService
    );
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  beforeEach(() => {
    return databaseService.cleanAll();
  });

  describe('exists', () => {
    it('throws an error when null', async () => {
      expect(() => {
        evaluationsService.exists(null);
      }).toThrow(NotFoundException);
    });

    it('returns true when given an evaluation', async () => {
      expect(() => {
        evaluationsService.exists(EVALUATION);
      }).toBeTruthy();
    });
  });

  describe('findAll', () => {
    it('should find all evaluations', async () => {
      let evaluationsDtoArray = await evaluationsService.findAll();
      expect(evaluationsDtoArray).toEqual([]);

      const evaluationOne = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      const evaluationTwo = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      evaluationsDtoArray = await evaluationsService.findAll();
      expect(evaluationsDtoArray).toContainEqual(evaluationOne);
      expect(evaluationsDtoArray).toContainEqual(evaluationTwo);
    });
  });

  describe('findById', () => {
    it('should find evaluations by id', async () => {
      const evaluation = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      const foundEvaluation = await evaluationsService.findById(evaluation.id);
      expect(evaluation).toEqual(foundEvaluation);
    });

    it('should throw an error if an evaluation does not exist', async () => {
      expect.assertions(1);
      await expect(evaluationsService.findById(-1)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('create', () => {
    it('should create a new evaluation with evaluation tags', async () => {
      const evaluation = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      expect(evaluation.id).toBeDefined();
      expect(evaluation.updatedAt).toBeDefined();
      expect(evaluation.createdAt).toBeDefined();
      expect(evaluation.data).toEqual(EVALUATION_WITH_TAGS_1.data);
      expect(evaluation.version).toEqual(EVALUATION_WITH_TAGS_1.version);
      expect(evaluation.evaluationTags[0].evaluationId).toBeDefined();
      expect(evaluation.evaluationTags[0].updatedAt).toBeDefined();
      expect(evaluation.evaluationTags[0].createdAt).toBeDefined();
      expect(evaluation.evaluationTags[0].value).toEqual(
        EVALUATION_WITH_TAGS_1.evaluationTags[0].value
      );
      expect(evaluation.evaluationTags[0].key).toEqual(
        EVALUATION_WITH_TAGS_1.evaluationTags[0].key
      );
    });

    it('should create a new evaluation without evaluation tags', async () => {
      const evaluation = await evaluationsService.create(
        CREATE_EVALUATION_DTO_WITHOUT_TAGS
      );
      expect(evaluation.id).toBeDefined();
      expect(evaluation.updatedAt).toBeDefined();
      expect(evaluation.createdAt).toBeDefined();
      expect(evaluation.data).toEqual(CREATE_EVALUATION_DTO_WITHOUT_TAGS.data);
      expect(evaluation.version).toEqual(
        CREATE_EVALUATION_DTO_WITHOUT_TAGS.version
      );
      expect(evaluation.evaluationTags.length).toBe(0);
      expect((await evaluationTagsService.findAll()).length).toBe(0);
    });

    it('should throw an error when missing the data field', async () => {
      expect.assertions(1);
      await expect(
        evaluationsService.create(CREATE_EVALUATION_DTO_WITHOUT_DATA)
      ).rejects.toThrow('notNull Violation: Evaluation.data cannot be null');
    });

    it('should throw an error when missing the version field', async () => {
      expect.assertions(1);
      await expect(
        evaluationsService.create(CREATE_EVALUATION_DTO_WITHOUT_VERSION)
      ).rejects.toThrow('notNull Violation: Evaluation.version cannot be null');
    });
  });

  // Current update implementation will not cascade to the evaluation tags
  describe('update', () => {
    it('should throw an error if an evaluation does not exist', async () => {
      expect.assertions(1);
      await expect(
        evaluationsService.update(-1, UPDATE_EVALUATION)
      ).rejects.toThrow(NotFoundException);
    });

    it('should update all fields of an evaluation', async () => {
      const evaluation = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      const updatedEvaluation = await evaluationsService.update(
        evaluation.id,
        UPDATE_EVALUATION
      );
      expect(updatedEvaluation.id).toEqual(evaluation.id);
      expect(updatedEvaluation.createdAt).toEqual(evaluation.createdAt);
      expect(updatedEvaluation.updatedAt).not.toEqual(evaluation.updatedAt);
      expect(updatedEvaluation.evaluationTags).not.toEqual(
        evaluation.evaluationTags
      );
      expect(updatedEvaluation.data).not.toEqual(evaluation.data);
      expect(updatedEvaluation.version).not.toEqual(evaluation.version);
    });

    it('should add additional evaluation tags to an evaluation', async () => {
      const evaluation = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      const updatedEvaluation = await evaluationsService.update(
        evaluation.id,
        UPDATE_EVALUATION_ADD_TAGS_1
      );
      expect(updatedEvaluation.id).toEqual(evaluation.id);
      expect(updatedEvaluation.createdAt).toEqual(evaluation.createdAt);
      expect(updatedEvaluation.data).toEqual(evaluation.data);
      expect(updatedEvaluation.version).toEqual(evaluation.version);
      // Evaluation was not updated, only assoc was.
      expect(updatedEvaluation.updatedAt).toEqual(evaluation.updatedAt);
      // ---
      expect(updatedEvaluation.evaluationTags).not.toEqual(
        evaluation.evaluationTags
      );
      expect(updatedEvaluation.evaluationTags.length).toBeGreaterThan(
        evaluation.evaluationTags.length
      );
      updatedEvaluation.evaluationTags.forEach(tag => {
        expect(tag.id).toBeDefined();
        expect(tag.createdAt).toBeDefined();
        expect(tag.updatedAt).toBeDefined();
      });
    });

    it('should remove tags from an evaluation', async () => {
      const evaluation = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      const updatedEvaluation = await evaluationsService.update(
        evaluation.id,
        UPDATE_EVALUATION_REMOVE_TAGS_1
      );
      expect(updatedEvaluation.id).toEqual(evaluation.id);
      expect(updatedEvaluation.createdAt).toEqual(evaluation.createdAt);
      expect(updatedEvaluation.data).toEqual(evaluation.data);
      expect(updatedEvaluation.version).toEqual(evaluation.version);
      // Evaluation was not updated, only assoc was.
      expect(updatedEvaluation.updatedAt).toEqual(evaluation.updatedAt);
      // ---
      expect(updatedEvaluation.evaluationTags).not.toEqual(
        evaluation.evaluationTags
      );
      expect(updatedEvaluation.evaluationTags.length).toEqual(0);
    });

    it('should update existing evaluation tags', async () => {
      const evaluation = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      const updateEvaluationTagDto: UpdateEvaluationTagDto = {
        id: evaluation.evaluationTags[0].id,
        key: 'updated key',
        value: 'updated value'
      };
      const updateEvaluationDto: UpdateEvaluationDto = {
        data: undefined,
        version: undefined,
        evaluationTags: [updateEvaluationTagDto]
      };
      const updatedEvaluation = await evaluationsService.update(
        evaluation.id,
        updateEvaluationDto
      );
      expect(updatedEvaluation.id).toEqual(evaluation.id);
      expect(updatedEvaluation.createdAt).toEqual(evaluation.createdAt);
      // Evaluation was not updated, only assoc was.
      expect(updatedEvaluation.updatedAt).toEqual(evaluation.updatedAt);
      expect(updatedEvaluation.data).toEqual(evaluation.data);
      expect(updatedEvaluation.version).toEqual(evaluation.version);
      // ---
      expect(updatedEvaluation.evaluationTags).not.toEqual(
        evaluation.evaluationTags
      );
      expect(updatedEvaluation.evaluationTags.length).toEqual(1);
      const originalTag = evaluation.evaluationTags[0];
      const updatedTag = updatedEvaluation.evaluationTags[0];
      expect(updatedTag.createdAt).toEqual(originalTag.createdAt);
      expect(updatedTag.updatedAt).not.toEqual(originalTag.updatedAt);
      expect(updatedTag.createdAt).toEqual(originalTag.createdAt);
      expect(updatedTag.key).toEqual(updateEvaluationTagDto.key);
      expect(updatedTag.value).toEqual(updateEvaluationTagDto.value);
    });

    it('should only update data if provided', async () => {
      const evaluation = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      const updatedEvaluation = await evaluationsService.update(
        evaluation.id,
        UPDATE_EVALUATION_DATA_ONLY
      );
      expect(updatedEvaluation.id).toEqual(evaluation.id);
      expect(updatedEvaluation.createdAt).toEqual(evaluation.createdAt);
      expect(updatedEvaluation.updatedAt).not.toEqual(evaluation.updatedAt);
      expect(updatedEvaluation.evaluationTags).toEqual(
        evaluation.evaluationTags
      );
      expect(updatedEvaluation.data).not.toEqual(evaluation.data);
      expect(updatedEvaluation.version).toEqual(evaluation.version);
    });

    it('should only update version if provided', async () => {
      const evaluation = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      const updatedEvaluation = await evaluationsService.update(
        evaluation.id,
        UPDATE_EVALUATION_VERSION_ONLY
      );
      expect(updatedEvaluation.id).toEqual(evaluation.id);
      expect(updatedEvaluation.createdAt).toEqual(evaluation.createdAt);
      expect(updatedEvaluation.updatedAt).not.toEqual(evaluation.updatedAt);
      expect(updatedEvaluation.evaluationTags).toEqual(
        evaluation.evaluationTags
      );
      expect(updatedEvaluation.data).toEqual(evaluation.data);
      expect(updatedEvaluation.version).not.toEqual(evaluation.version);
    });
  });

  describe('remove', () => {
    it('should remove an evaluation and its evaluation tags given an id', async () => {
      const evaluation = await evaluationsService.create(
        EVALUATION_WITH_TAGS_1
      );
      const removedEvaluation = await evaluationsService.remove(evaluation.id);
      const foundEvaluationTags = await evaluationTagsService.findAll();
      expect(foundEvaluationTags.length).toEqual(0);
      expect(removedEvaluation).toEqual(evaluation);

      await expect(
        evaluationsService.findById(removedEvaluation.id)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error when the evaluation does not exist', async () => {
      expect.assertions(1);
      await expect(evaluationsService.findById(-1)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  afterAll(async () => {
    await databaseService.cleanAll();
    await databaseService.closeConnection();
  });
});
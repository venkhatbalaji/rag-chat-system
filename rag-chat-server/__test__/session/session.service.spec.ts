import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '../../src/session/session.service';
import { getModelToken } from '@nestjs/mongoose';
import { Session } from '../../src/session/schemas/session.schema';
import { Message } from '../../src/chat/schemas/message.schema';
import { ChatService } from '../../src/chat/chat.service';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Response } from 'express';

describe('SessionService', () => {
  let service: SessionService;

  const mockSessionModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockMessageModel = {
    deleteMany: jest.fn(),
  };

  const mockChatService = {
    processMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: getModelToken(Session.name), useValue: mockSessionModel },
        { provide: getModelToken(Message.name), useValue: mockMessageModel },
        { provide: ChatService, useValue: mockChatService },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSessions', () => {
    it('should return paginated sessions', async () => {
      const mockSessions = [{ title: 'Session A' }];
      mockSessionModel.exec.mockResolvedValue(mockSessions);

      const result = await service.getSessions({ userId: 'u1', limit: 10, offset: 0 });
      expect(result).toEqual(mockSessions);
      expect(mockSessionModel.find).toHaveBeenCalledWith({ userId: 'u1' });
    });
  });

  describe('createSession', () => {
    it('should create a session and trigger chatService.processMessage', async () => {
      const userId = 'user123';
      const title = 'New Chat';
      const sessionId = new Types.ObjectId();
      const mockRes = {} as Response;

      mockSessionModel.create.mockResolvedValue({ _id: sessionId });

      await service.createSession(userId, title, mockRes);

      expect(mockSessionModel.create).toHaveBeenCalledWith({ userId, title });
      expect(mockChatService.processMessage).toHaveBeenCalledWith(
        sessionId.toString(),
        'user',
        title,
        mockRes,
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete session and related messages', async () => {
      const sessionId = 'abc123';
      const mockSession = { _id: sessionId };
      mockSessionModel.findById.mockResolvedValue(mockSession);
      mockSessionModel.deleteOne.mockResolvedValue({ acknowledged: true });
      mockMessageModel.deleteMany.mockResolvedValue({});

      const result = await service.deleteSession(sessionId);

      expect(mockMessageModel.deleteMany).toHaveBeenCalledWith({ sessionId });
      expect(mockSessionModel.deleteOne).toHaveBeenCalledWith({ _id: sessionId });
      expect(result.acknowledged).toBe(true);
    });

    it('should throw if session not found', async () => {
      mockSessionModel.findById.mockResolvedValue(null);
      await expect(service.deleteSession('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSession', () => {
    it('should update session and return the updated session', async () => {
      const sessionId = 'xyz789';
      const updates = { title: 'Renamed' };
      const updatedSession = { _id: sessionId, title: 'Renamed' };

      mockSessionModel.findById
        .mockResolvedValueOnce({ _id: sessionId }) // first call: existing
        .mockResolvedValueOnce(updatedSession);    // second call: updated

      const result = await service.updateSession(sessionId, updates);

      expect(mockSessionModel.updateOne).toHaveBeenCalledWith({ _id: sessionId }, updates);
      expect(result).toEqual(updatedSession);
    });

    it('should throw if session not found', async () => {
      mockSessionModel.findById.mockResolvedValue(null);
      await expect(service.updateSession('missing', {})).rejects.toThrow(NotFoundException);
    });
  });
});

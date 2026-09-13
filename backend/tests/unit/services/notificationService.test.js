jest.mock('../../../config/db', () => ({
  query: jest.fn()
}));

const db = require('../../../config/db');
const {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../../../services/notificationService');

describe('notificationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should insert notification with correct params', async () => {
      db.query.mockResolvedValue([{ insertId: 42 }]);

      const id = await createNotification(1, 5, {
        type: 'alert',
        title: 'New appointment',
        body: 'You have a new appointment',
        data: { appointment_id: 10 }
      });

      expect(id).toBe(42);
      expect(db.query).toHaveBeenCalledTimes(1);
      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('INSERT INTO rv_notification');
      expect(params[0]).toBe(1); // tenant_id
      expect(params[1]).toBe(5); // user_id
      expect(params[2]).toBe('alert'); // type
      expect(params[3]).toBe('New appointment'); // title
      expect(params[4]).toBe('You have a new appointment'); // body
      expect(params[5]).toBe(JSON.stringify({ appointment_id: 10 })); // data
    });
  });

  describe('getNotifications', () => {
    it('should query with pagination', async () => {
      db.query
        .mockResolvedValueOnce([[{ total: 50 }]]) // count query
        .mockResolvedValueOnce([[{ id: 1, title: 'Test' }]]); // rows query

      const result = await getNotifications(5, 1, { page: 2, limit: 10 });

      expect(result.notifications).toEqual([{ id: 1, title: 'Test' }]);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
      expect(db.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count', async () => {
      db.query.mockResolvedValue([[{ count: 7 }]]);

      const count = await getUnreadCount(5, 1);

      expect(count).toBe(7);
      expect(db.query).toHaveBeenCalledTimes(1);
      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('is_read = 0');
      expect(params).toEqual([5, 1]);
    });
  });

  describe('markAsRead', () => {
    it('should update notification and return true when affected', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await markAsRead(10, 5);

      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledTimes(1);
      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('UPDATE rv_notification');
      expect(params).toEqual([10, 5]);
    });

    it('should return false when no rows affected', async () => {
      db.query.mockResolvedValue([{ affectedRows: 0 }]);

      const result = await markAsRead(999, 5);

      expect(result).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('should update all for user/tenant', async () => {
      db.query.mockResolvedValue([{ affectedRows: 3 }]);

      const count = await markAllAsRead(5, 1);

      expect(count).toBe(3);
      expect(db.query).toHaveBeenCalledTimes(1);
      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('UPDATE rv_notification');
      expect(params).toEqual([5, 1]);
    });
  });
});

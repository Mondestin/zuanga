import postgres from 'postgres';
declare const sql: postgres.Sql<{}>;
/**
 * Test database connection
 */
export declare function testConnection(): Promise<void>;
/**
 * Close database connection gracefully
 */
export declare function closeConnection(): Promise<void>;
export default sql;
//# sourceMappingURL=connection.d.ts.map
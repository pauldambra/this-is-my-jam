
interface LastEvaluatedKey {
  id: number;
  timestamp: string;
}

interface DynamoSortable {
  id: number;
  timestamp: string;
}

interface Queryer {
  query(object): any;
}

interface Storer {
  put(object): any;
}

interface LastToot {
  lastToot: DynamoSortable;
  id: string;
}

interface LastTootResults {
  Items: Array<LastToot>;
  Count: 0 | 1;
  ScannedCount: 0 | 1;
}

export async function getLastTootStored (tableName: string, docClient: Queryer, lastTootId: string): Promise<number | undefined> {
  const params = {
    TableName: tableName,
    Limit: 1,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': lastTootId
    }
  }

  const results: LastTootResults = await docClient.query(params).promise()
  console.log(results, 'query results')

  let sinceId: number | undefined
  if (results && results.Items && results.Items[0]) {
    sinceId = results.Items[0].lastToot.id
  }
  console.log(sinceId, 'last stored toot id')
  return sinceId
}

const sortDescending = (a, b) => (a.timestamp > b.timestamp) ? -1 : ((a.timestamp < b.timestamp) ? 1 : 0)

export async function setLastTootStored (tableName: string, docClient: Storer, lastTootId: string, items: Array<DynamoSortable>): Promise<void> {
  const latest = items.sort(sortDescending)[0]
  if (latest) {
    const params = {
      TableName: tableName,
      Item: {
        id: lastTootId,
        lastToot: latest
      }
    }
    return docClient.put(params).promise()
  }
}

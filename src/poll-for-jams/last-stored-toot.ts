
export interface StoredToot extends DynamoSortable {
  id: string;
  user: string;
  timestamp: string;
  toot: string;
}

interface DynamoSortable {
  id: string;
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

export async function getLastTootStored (tableName: string, docClient: Queryer, lastTootId: string): Promise<string | undefined> {
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

  let sinceId: string | undefined
  if (results && results.Items && results.Items[0]) {
    sinceId = results.Items[0].lastToot.id
  }
  console.log(sinceId, 'last stored toot id')
  return sinceId
}

const sortDescending = (a, b): 0 | 1 | -1 => (a.timestamp > b.timestamp) ? -1 : ((a.timestamp < b.timestamp) ? 1 : 0)

export function sortToots<T extends DynamoSortable> (items: Array<T>): Array<T> {
  return items.sort(sortDescending)
}

export async function setLastTootStored (tableName: string, docClient: Storer, lastTootId: string, items: Array<DynamoSortable>): Promise<void> {
  const latest = sortToots(items)[0]
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

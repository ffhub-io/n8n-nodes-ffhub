import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IHttpRequestMethods,
  IDataObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export class FFHub implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'FFHub',
    name: 'ffHub',
    icon: 'file:ffhub.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'FFHub - Cloud FFmpeg transcoding service',
    defaults: {
      name: 'FFHub',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'ffhubApi',
        required: true,
      },
    ],
    properties: [
      // 操作选择
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Create Task',
            value: 'createTask',
            description: 'Create a new FFmpeg transcoding task',
            action: 'Create a transcoding task',
          },
          {
            name: 'Get Task',
            value: 'getTask',
            description: 'Get task status and result',
            action: 'Get task status',
          },
          {
            name: 'List Tasks',
            value: 'listTasks',
            description: 'List all tasks',
            action: 'List all tasks',
          },
          {
            name: 'Wait for Completion',
            value: 'waitForCompletion',
            description: 'Wait until task completes or fails',
            action: 'Wait for task completion',
          },
        ],
        default: 'createTask',
      },

      // ========== Create Task 参数 ==========
      {
        displayName: 'FFmpeg Command',
        name: 'command',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['createTask'],
          },
        },
        placeholder: 'ffmpeg -i https://example.com/video.mp4 -c:v libx264 output.mp4',
        description: 'Full FFmpeg command. Input files must be accessible URLs.',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            operation: ['createTask'],
          },
        },
        options: [
          {
            displayName: 'Webhook URL',
            name: 'webhook',
            type: 'string',
            default: '',
            description: 'URL to receive a callback when task completes',
          },
          {
            displayName: 'Include Metadata',
            name: 'withMetadata',
            type: 'boolean',
            default: false,
            description: 'Whether to include ffprobe metadata for output files',
          },
        ],
      },

      // ========== Get Task 参数 ==========
      {
        displayName: 'Task ID',
        name: 'taskId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['getTask', 'waitForCompletion'],
          },
        },
        description: 'The ID of the task to retrieve',
      },

      // ========== Wait for Completion 参数 ==========
      {
        displayName: 'Polling Interval (Seconds)',
        name: 'pollingInterval',
        type: 'number',
        default: 5,
        displayOptions: {
          show: {
            operation: ['waitForCompletion'],
          },
        },
        description: 'How often to check task status',
      },
      {
        displayName: 'Timeout (Seconds)',
        name: 'timeout',
        type: 'number',
        default: 600,
        displayOptions: {
          show: {
            operation: ['waitForCompletion'],
          },
        },
        description: 'Maximum time to wait for task completion (0 = no limit)',
      },

      // ========== List Tasks 参数 ==========
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            operation: ['listTasks'],
          },
        },
        options: [
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              { name: 'All', value: '' },
              { name: 'Pending', value: 'pending' },
              { name: 'Running', value: 'running' },
              { name: 'Completed', value: 'completed' },
              { name: 'Failed', value: 'failed' },
            ],
            default: '',
            description: 'Filter by task status',
          },
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 20,
            description: 'Maximum number of tasks to return',
          },
          {
            displayName: 'Offset',
            name: 'offset',
            type: 'number',
            default: 0,
            description: 'Number of tasks to skip',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('ffhubApi');
    const baseUrl = credentials.baseUrl as string;

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;
        let responseData: IDataObject = {};

        if (operation === 'createTask') {
          // 创建转码任务
          const command = this.getNodeParameter('command', i) as string;
          const options = this.getNodeParameter('options', i, {}) as {
            webhook?: string;
            withMetadata?: boolean;
          };

          responseData = await this.helpers.httpRequestWithAuthentication.call(
            this,
            'ffhubApi',
            {
              method: 'POST' as IHttpRequestMethods,
              url: `${baseUrl}/tasks`,
              body: {
                command,
                webhook: options.webhook || undefined,
                with_metadata: options.withMetadata || false,
              },
              json: true,
            },
          );
        } else if (operation === 'getTask') {
          // 获取任务状态
          const taskId = this.getNodeParameter('taskId', i) as string;

          responseData = await this.helpers.httpRequestWithAuthentication.call(
            this,
            'ffhubApi',
            {
              method: 'GET' as IHttpRequestMethods,
              url: `${baseUrl}/tasks/${taskId}`,
              json: true,
            },
          );
        } else if (operation === 'waitForCompletion') {
          // 等待任务完成
          const taskId = this.getNodeParameter('taskId', i) as string;
          const pollingInterval = this.getNodeParameter('pollingInterval', i) as number;
          const timeout = this.getNodeParameter('timeout', i) as number;

          const startTime = Date.now();
          const timeoutMs = timeout * 1000;

          while (true) {
            responseData = await this.helpers.httpRequestWithAuthentication.call(
              this,
              'ffhubApi',
              {
                method: 'GET' as IHttpRequestMethods,
                url: `${baseUrl}/tasks/${taskId}`,
                json: true,
              },
            );

            const status = responseData.status as string;

            // 任务已完成或失败
            if (status === 'completed' || status === 'failed') {
              break;
            }

            // 检查超时
            if (timeout > 0 && Date.now() - startTime > timeoutMs) {
              throw new NodeApiError(this.getNode(), {
                message: `Task did not complete within ${timeout} seconds`,
                description: `Current status: ${status}`,
              });
            }

            // 等待后重试
            await new Promise((resolve) => setTimeout(resolve, pollingInterval * 1000));
          }
        } else if (operation === 'listTasks') {
          // 获取任务列表
          const filters = this.getNodeParameter('filters', i, {}) as {
            status?: string;
            limit?: number;
            offset?: number;
          };

          const queryParams: Record<string, string | number> = {};
          if (filters.status) queryParams.status = filters.status;
          if (filters.limit) queryParams.limit = filters.limit;
          if (filters.offset) queryParams.offset = filters.offset;

          responseData = await this.helpers.httpRequestWithAuthentication.call(
            this,
            'ffhubApi',
            {
              method: 'GET' as IHttpRequestMethods,
              url: `${baseUrl}/tasks`,
              qs: queryParams,
              json: true,
            },
          );
        }

        returnData.push({ json: responseData });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

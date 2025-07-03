export interface ApiResponse2<T>{
    statusCode: number,
    isSuccess: boolean,
    message: string,
    data: T
  }

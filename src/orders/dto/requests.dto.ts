import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { RequestDto } from "./request.dto";


export class RequestsDto {

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RequestDto)
    requests: RequestDto[]
}
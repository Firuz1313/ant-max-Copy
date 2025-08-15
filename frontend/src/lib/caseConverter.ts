/**
 * Utility functions for converting between camelCase and snake_case
 * Used to transform data between frontend (camelCase) and backend (snake_case)
 */

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function convertObjectKeys<T = any>(
  obj: any,
  converter: (key: string) => string,
): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      convertObjectKeys(item, converter),
    ) as unknown as T;
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const converted: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = converter(key);
      converted[newKey] = convertObjectKeys(value, converter);
    }

    return converted;
  }

  return obj;
}

export function camelCaseKeys<T = any>(obj: any): T {
  return convertObjectKeys(obj, snakeToCamel);
}

export function snakeCaseKeys<T = any>(obj: any): T {
  return convertObjectKeys(obj, camelToSnake);
}

// Mapping for common field transformations
export const FIELD_MAPPINGS = {
  // Backend -> Frontend
  backend_to_frontend: {
    created_at: "createdAt",
    updated_at: "updatedAt",
    is_active: "isActive",
    device_id: "deviceId",
    problem_id: "problemId",
    step_id: "stepId",
    session_id: "sessionId",
    user_id: "userId",
    tv_interface_id: "tvInterfaceId",
    remote_id: "remoteId",
    step_number: "stepNumber",
    estimated_time: "estimatedTime",
    success_rate: "successRate",
    completed_count: "completedCount",
    order_index: "order",
    image_url: "imageUrl",
    logo_url: "logoUrl",
    highlight_remote_button: "highlightRemoteButton",
    highlight_tv_area: "highlightTVArea",
    action_type: "actionType",
    button_position: "buttonPosition",
    svg_path: "svgPath",
    zone_id: "zoneId",
    required_action: "requiredAction",
    validation_rules: "validationRules",
    success_condition: "successCondition",
    failure_actions: "failureActions",
    warning_text: "warningText",
    success_text: "successText",
    next_step_conditions: "nextStepConditions",
  },

  // Frontend -> Backend
  frontend_to_backend: {
    createdAt: "created_at",
    updatedAt: "updated_at",
    isActive: "is_active",
    deviceId: "device_id",
    problemId: "problem_id",
    stepId: "step_id",
    sessionId: "session_id",
    userId: "user_id",
    tvInterfaceId: "tv_interface_id",
    remoteId: "remote_id",
    stepNumber: "step_number",
    estimatedTime: "estimated_time",
    successRate: "success_rate",
    completedCount: "completed_count",
    order: "order_index",
    imageUrl: "image_url",
    logoUrl: "logo_url",
    highlightRemoteButton: "highlight_remote_button",
    highlightTVArea: "highlight_tv_area",
    actionType: "action_type",
    buttonPosition: "button_position",
    svgPath: "svg_path",
    zoneId: "zone_id",
    requiredAction: "required_action",
    validationRules: "validation_rules",
    successCondition: "success_condition",
    failureActions: "failure_actions",
    warningText: "warning_text",
    successText: "success_text",
    nextStepConditions: "next_step_conditions",
  },
};

export function transformToFrontend<T = any>(data: any): T {
  if (!data) return data;

  return convertObjectKeys(data, (key: string) => {
    return (
      FIELD_MAPPINGS.backend_to_frontend[
        key as keyof typeof FIELD_MAPPINGS.backend_to_frontend
      ] || snakeToCamel(key)
    );
  });
}

export function transformToBackend<T = any>(data: any): T {
  if (!data) return data;

  return convertObjectKeys(data, (key: string) => {
    return (
      FIELD_MAPPINGS.frontend_to_backend[
        key as keyof typeof FIELD_MAPPINGS.frontend_to_backend
      ] || camelToSnake(key)
    );
  });
}

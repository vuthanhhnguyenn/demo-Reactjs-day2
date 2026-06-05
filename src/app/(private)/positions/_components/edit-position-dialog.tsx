"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type Position,
  type UpdatePositionRequest,
  UpdatePositionRequestSchema,
} from "@/lib/api/position.schema";

import { POSITION_ROLES } from "../_constants/constants";
import { CREATE_POSITION_PERMISSIONS } from "../_schemas/create-position.schema";

type EditPositionDialogProps = {
  position: Position | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdatePosition: (values: UpdatePositionRequest) => Promise<void>;
  isUpdating?: boolean;
};

function getDescription(position: Position) {
  return typeof position.features.description === "string"
    ? position.features.description
    : "";
}

function getPermissions(position: Position) {
  return Object.entries(position.features)
    .filter(([key, value]) => key !== "description" && value === true)
    .map(([key]) => key);
}

export function EditPositionDialog({
  position,
  open,
  onOpenChange,
  onUpdatePosition,
  isUpdating,
}: EditPositionDialogProps) {
  const form = useForm<UpdatePositionRequest>({
    resolver: zodResolver(UpdatePositionRequestSchema),
    defaultValues: {
      id: 0,
      position_name: "",
      role: "staff",
      description: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (!position) {
      return;
    }

    form.reset({
      id: position.id,
      position_name: position.position_name,
      role: position.role,
      description: getDescription(position),
      permissions: getPermissions(position),
    });
  }, [position, form]);

  async function handleSubmit(values: UpdatePositionRequest) {
    try {
      await onUpdatePosition(values);
      onOpenChange(false);
    } catch {
      // Keep the dialog open so the user can adjust the form and retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sửa chức vụ</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="position_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chức vụ</FormLabel>
                  <FormControl>
                    <Input
                      className="truncate"
                      placeholder="Nhập tên chức vụ"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {POSITION_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>Mô tả quyền</FormLabel>
                  <FormControl className="min-w-0">
                    <Textarea
                      className="max-h-40 min-w-0 resize-y break-all whitespace-pre-wrap"
                      placeholder="Mô tả ngắn về quyền hạn của chức vụ"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <FormLabel>Các quyền</FormLabel>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {CREATE_POSITION_PERMISSIONS.map((permission) => (
                      <FormField
                        key={permission}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => {
                          const checked = field.value.includes(permission);

                          return (
                            <FormItem className="flex min-w-0 flex-row items-center gap-2 rounded-md border p-3">
                              <FormControl>
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(value) => {
                                    if (value) {
                                      field.onChange([
                                        ...field.value,
                                        permission,
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (item) => item !== permission,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="min-w-0 break-words font-normal">
                                {permission}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

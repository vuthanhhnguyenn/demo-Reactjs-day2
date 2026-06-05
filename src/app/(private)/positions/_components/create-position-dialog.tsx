"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";
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
  CREATE_POSITION_PERMISSIONS,
  CreatePositionSchema,
  type CreatePositionFormValues,
} from "../_schemas/create-position.schema";

import { POSITION_ROLES } from "../_constants/constants";

type CreatePositionDialogProps = {
  onCreatePosition: (values: CreatePositionFormValues) => void;
  isCreating?: boolean;
};



export function CreatePositionDialog({
  onCreatePosition, isCreating
}: CreatePositionDialogProps) {
  
  const [open, setOpen] = useState(false);

  const form = useForm<CreatePositionFormValues>({
    resolver: zodResolver(CreatePositionSchema),
    defaultValues: {
      position_name: "",
      role: "staff",
      description: "",
      permissions: [],
    },
  });

  function handleSubmit(values: CreatePositionFormValues) {
    onCreatePosition(values);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open = {open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Tạo chức vụ</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo chức vụ thử </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm"></p>
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

            <Button type="submit" className="w-full" disabled = {isCreating}>
              Tạo chức vụ
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

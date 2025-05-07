import { z } from "zod";
import { UserBookStatus } from "../../types";

export const createUserBookSchema = z
  .object({
    book: z.object({
      title: z.string().min(1).max(255),
      language: z.string().min(2).max(50),
      authors: z
        .array(
          z.object({
            name: z.string().min(1).max(255),
          })
        )
        .min(1),
    }),
    status: z.enum([UserBookStatus.READ, UserBookStatus.TO_READ, UserBookStatus.REJECTED]),
    rating: z.boolean().nullable().optional(),
    recommendation_id: z.string().uuid().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.status === UserBookStatus.READ && data.rating === undefined) {
        return false;
      }
      return true;
    },
    {
      message: "Rating is required when status is 'read'",
      path: ["rating"],
    }
  );

export type CreateUserBookSchemaType = z.infer<typeof createUserBookSchema>;

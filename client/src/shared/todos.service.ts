import { edenFetch } from "@elysiajs/eden";
import { App } from "server";
import env from "../env";
import { handleError } from "../utils/handleError";

export const fetch = edenFetch<App>(env.SERVER_URL);

async function getTodos() {
  return fetch("/api/todos/", { method: "GET" }).then(handleError);
}

export type Todo = Awaited<ReturnType<typeof getTodos>>[number];

async function addTodo(todo: Omit<Todo, "id" | "completed" | "createdAt">) {
  return fetch("/api/todos/", {
    method: "POST",
    body: todo,
  }).then(handleError);
}

async function updateTodo(todoId: Todo["id"], todo: Partial<Omit<Todo, "id">>) {
  return fetch("/api/todos/:id", {
    method: "PUT",
    params: {
      id: todoId,
    },
    body: todo,
  }).then(handleError);
}

async function removeTodo(todoId: Todo["id"]) {
  return fetch("/api/todos/:id", {
    method: "DELETE",
    params: {
      id: todoId,
    },
  }).then(handleError);
}

export const todosService = {
  getTodos,
  addTodo,
  updateTodo,
  removeTodo,
};

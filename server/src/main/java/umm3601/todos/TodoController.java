package umm3601.todos;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpCode;
import io.javalin.http.NotFoundResponse;

/**
 * Controller that manages requests for info about todos.
 */
public class TodoController {

  private static final String OWNER_KEY = "owner";
  private static final String STATUS_KEY  = "status";

  private final JacksonMongoCollection<Todo> todosCollection;

  /**
   * Construct a controller for todos.
   *
   * @param database the database containing todos data
   */
  public TodoController(MongoDatabase database) {
    todosCollection = JacksonMongoCollection.builder().build(database, "todos", Todo.class);
  }

  /**
   * Get the single todos specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTodo(Context ctx) {
    String id = ctx.pathParam("id");
    Todo todos;

    try {
      todos = todosCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested todos id wasn't a legal Mongo Object ID.");
    }
    if (todos == null) {
      throw new NotFoundResponse("The requested todos was not found");
    } else {
      ctx.json(todos);
    }
  }

  /**
   * Delete the todos specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void deleteTodo(Context ctx) {
    String id = ctx.pathParam("id");
    todosCollection.deleteOne(eq("_id", new ObjectId(id)));
  }

  /**
   * Get a JSON response with a list of all the todos.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTodos(Context ctx) {

    List<Bson> filters = new ArrayList<>(); // start with a blank document

    if (ctx.queryParamMap().containsKey(STATUS_KEY)) {
      Boolean status = ctx.queryParamAsClass(STATUS_KEY, Boolean.class).get();
      filters.add(eq(STATUS_KEY, status));
    }

    if (ctx.queryParamMap().containsKey(OWNER_KEY)) {
      String targetOwner = ctx.queryParam(OWNER_KEY);
      Pattern pattern = Pattern.compile(Pattern.quote(targetOwner), Pattern.CASE_INSENSITIVE);
      Bson ownerRegex = regex(OWNER_KEY, pattern);
      filters.add(ownerRegex);
    }

    // Sort the results. Use the `sortby` query param (default "name")
    // as the field to sort by, and the query param `sortorder` (default
    // "asc") to specify the sort order.
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "name");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");

    ctx.json(todosCollection.find(filters.isEmpty() ? new Document() : and(filters))
      .sort(sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy))
      .into(new ArrayList<>()));
  }

  /**
   * Get a JSON response with a list of all the todos.
   *
   * @param ctx a Javalin HTTP context
   */
  public void addNewTodo(Context ctx) {
    Todo newTodos = ctx.bodyValidator(Todo.class)
       // Verify that the todos has a owner that is not blank
      .check(usr -> usr.owner != null && usr.owner.length() > 0, "Todos must have a non-empty owner")
      // Verify that the todo have a body that is not blank
      .check(usr -> usr.body != null && usr.body.length() > 0, "Todos must have a non-empty body")
      // Verify that the todo have a category that is not blank
      .check(usr -> usr.category!= null && usr.category.length() > 0, "Todos must have a non-empty category")
      .get();

    todosCollection.insertOne(newTodos);
    ctx.status(HttpCode.OK);
    ctx.json(Map.of("id", newTodos._id));
  }

  /**
   * Utility function to generate the md5 hash for a given string
   *
   * @param str the string to generate a md5 for
   */
  @SuppressWarnings("lgtm[java/weak-cryptographic-algorithm]")
  public String md5(String str) throws NoSuchAlgorithmException {
    MessageDigest md = MessageDigest.getInstance("MD5");
    byte[] hashInBytes = md.digest(str.toLowerCase().getBytes(StandardCharsets.UTF_8));

    StringBuilder result = new StringBuilder();
    for (byte b : hashInBytes) {
      result.append(String.format("%02x", b));
    }
    return result.toString();
  }
}


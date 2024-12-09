best not unpack the context entry since its contents are reset between parsing runs.
You should thus only have the context object itself withing your closure.
